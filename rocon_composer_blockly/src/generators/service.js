var _ = require('lodash'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  xml2js = Promise.promisifyAll(require('xml2js')),
  libxml = require('libxmljs'),
  vkbeautify = require('vkbeautify'),
  os = require('os'),
  exec = Promise.promisify(require('child_process').exec),
  Path = require('path'),
  yaml = require('js-yaml'),
  nodegit = require('nodegit'),
  request = require('superagent'),
  Settings = require('../model').Settings,
  GeneratorMixin = require('./mixin'),
  mkdirp = require('mkdirp');
  // ServiceStore = require('./service_store');
  

var ServiceStore = function(options){
  // options
  // - ros_root
  this.options = options;
  this.repo_root = Path.join(os.tmpdir(), "service_repository");

  this.github = new GithubRepo({
    repo_root: this.repo_root,
    working_repo: config.service_repo,
    base_repo: config.service_repo_base,
    working_branch: config.service_repo_branch,
    github_token: config.github_token
  });

};


_.extend(ServiceStore.prototype, GeneratorMixin);


ServiceStore.prototype.createPackage = function(package_meta){
  return this._withRepo()
    .then(function(repo){
      var workdir = repo.workdir();

      var content_cmakelist = _.template("cmake_minimum_required(VERSION 2.8.3)\n" + 
        "project(<%= name %>)   # <%= name %>\n" +
        "\n" + 
        "find_package(catkin REQUIRED)\n" +
        "catkin_package()\n")(package_meta);

      var content_packagexml = _.template("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+
        "<package>\n"+
        "  <name><%= name %></name> <!-- <%= name %> -->\n"+
        "  <version>0.0.0</version>\n"+
        "  <description><%= description %></description>\n"+
        "  <maintainer email=\"<%= maintainer_email %>\"><%= maintainer %></maintainer> <!-- uploader -->\n"+
        "  <license>BSD</license>\n"+
        "  <buildtool_depend>catkin</buildtool_depend>\n"+
        "</package>")(package_meta);

    })

};


ServiceStore.prototype.allPackageInfos = function(){
  return this.packages();
};


ServiceStore.prototype._generate = function(package, service_meta, package_name){

  var all_thens = [];
  var pack = package;

  var name_key = service_meta.name.replace(/\s+/g, "_").toLowerCase();
  var service_base = Path.join( Path.dirname(pack.path), "services", name_key);
  var workflows_base = Path.join( service_base, "workflows" );





  var xml = fs.readFileSync(pack.path)
  var xmlDoc = libxml.parseXmlString(xml);
  var package = xmlDoc.get('/package');

  var node = package.get('//export');
  if(!node){
   node = package.node('export');
  }
  var node_val = Path.join('services', name_key, name_key+'.service');
  var exists = node.get("//concert_service[text()='"+node_val+"']")
  if(!exists){
    node.node('concert_service', node_val);
  }


  var resultXml = xmlDoc.toString(true);
  resultXml = vkbeautify.xml(resultXml);

  console.log('XML', resultXml);


  fs.writeFileSync(pack.path, resultXml);




  console.log(service_base);


  mkdirp.sync(service_base);




  if(service_meta.workflows && service_meta.workflows.length){
    mkdirp.sync(workflows_base);

    _.reduce(service_meta.workflows, function(thens, wf_title){
      var data = _.find(workflow_items, {title: wf_title});

      _.each(service_meta.interactions, function(inter){
        if(inter.key){
          _.each(inter.remappings, function(remap){
            data.js = data.js.replace(
              new RegExp(_.escapeRegExp("{{" + remap.remap_from + "-" + inter.key + "}}"), 'g'),
              remap.remap_to);

          });
        }
      });


      var data_s = JSON.stringify(data);
      _.each(service_meta.parameters, function(param){
        if(param.expose){
          data_s = data_s.replace(
            new RegExp(_.escapeRegExp("\\\"({{parameter:" + param.key + "}})\\\"" ), 'g'),
            _.template("$engine.getServiceParameter('<%= service_name %>', '<%= param %>')")({service_name: name_key, param: param.key})
          );
        }else{
          data_s = data_s.replace(
            new RegExp(_.escapeRegExp("({{parameter:" + param.key + "}})"), 'g'),
            param.value);
        }

        

      });


      return thens.concat(fs.writeFileAsync(workflows_base + "/" + wf_title + ".wf", 
                               data_s));
    }, all_thens);

  }

  console.log(name_key);


  // .parameters
  var params = _(service_meta.parameters).filter({expose: true}).indexBy('key').mapValues('value').value()
  if(service_meta.workflows && service_meta.workflows.length){
    params.workflows = package_name + "/" + name_key + ".workflows";
  }
  var param_file_content = yaml.dump(params);
  console.log('---------------- .parameters --------------------');
  console.log(param_file_content);

  console.log('---------------- .interactions --------------------');
  _.each(service_meta.interactions, function(i){
    i.parameters = _(i.parameters).indexBy('key').mapValues('value').value();
    delete i._id;
  });

  service_meta.interactions = _.map(service_meta.interactions, function(inter){
    return _.omit(inter, 'key');
  });

  console.log(yaml.dump(service_meta.interactions));


  console.log('---------------- .launcher --------------------');
  console.log(service_meta.launcher_body);

  console.log('---------------- .service --------------------');
  // .service
  var service_kv = _.pick(service_meta, "name description author priority interactions parameters launcher_type".split(/\s+/));
  service_kv.launcher = package_name + "/" + name_key;
  service_kv.interactions = package_name + "/" + name_key;
  service_kv.parameters = package_name + "/" + name_key;
  var service_file_content = yaml.dump(service_kv);
  console.log(service_file_content);

  // .workflows
  if(service_meta.workflows && service_meta.workflows.length){
    var workflows = _.map(service_meta.workflows, function(wfname){
      return {workflow: package_name + "/" + wfname + ".wf"};
    });
    var wf_thenable = fs.writeFileAsync(service_base + "/" + name_key + ".workflows", yaml.dump({workflows: workflows}));
    all_thens.push(wf_thenable);

  }

  // save icon

  all_thens = all_thens.concat([
    fs.writeFileAsync(service_base + "/" + name_key + ".parameters", param_file_content),
    fs.writeFileAsync(service_base + "/" + name_key + ".launch", service_meta.launcher_body),
    fs.writeFileAsync(service_base + "/" + name_key + ".service", service_file_content),
    fs.writeFileAsync(service_base + "/" + name_key + ".interactions", yaml.dump(service_meta.interactions))
  ]);


  return Promise.all(all_thens);

};

ServiceStore.prototype.exportToROS = function(title, description, service_meta, package_name){
  var that = this;

  return that.github.sync_repo().then(function(){
    var new_branch_name = 'new-branch-'+(new Date().getTime());
    return that.github.create_branch(config.rapp_repo_branch, new_branch_name).then(function(branch){

      return that.github.checkout(new_branch_name).then(function(){

        return that.allPackageInfos()
        .then(function(packages){ 

          return new Promise(function(resolve, reject){
            Settings.getItems(function(e, workflow_items){
              if(e){ reject(e); return; }
              else { resolve(workflow_items); }
            });
          })
          .then(function(workflow_items){

            logger.debug("packages", _.pluck(packages, 'name'));
            console.log(service_meta);
            console.log(package_name);

            var pack = _.find(packages, {name: package_name});
            console.log("PACK", pack);

            return that._generate(pack, service_meta, package_name);

          })
          .then(function(ok){
            return that.github.addCommitPushPR(title, description);

          })
          .catch(function(e){
            logger.error(e);

          });

        })


      });

    });
  });


}

ServiceStore.prototype._exportToROS = function(title, description, service_meta, package_name){
  var that = this;

  return this.allPackageInfos()
    .then(function(packages){ 

      return new Promise(function(resolve, reject){
        Settings.getItems(function(e, workflow_items){
          if(e){ reject(e); return; }
          else { resolve(workflow_items); }
        });
      })
      .then(function(workflow_items){

        logger.debug("packages", _.pluck(packages, 'name'));
        console.log(service_meta);
        console.log(package_name);

        var pack = _.find(packages, {name: package_name});
        console.log("PACK", pack);


        var name_key = service_meta.name.replace(/\s+/g, "_").toLowerCase();
        var service_base = Path.join( Path.dirname(pack.path), "services", name_key);
        var workflows_base = Path.join( service_base, "workflows" );





        var xml = fs.readFileSync(pack.path)
        var xmlDoc = libxml.parseXmlString(xml);
        var package = xmlDoc.get('/package');

        var node = package.get('//export');
        if(!node){
         node = package.node('export');
        }
        var node_val = Path.join('services', name_key, name_key+'.service');
        var exists = node.get("//concert_service[text()='"+node_val+"']")
        if(!exists){
          node.node('concert_service', node_val);
        }


        var resultXml = xmlDoc.toString(true);
        resultXml = vkbeautify.xml(resultXml);

        console.log('XML', resultXml);


        fs.writeFileSync(pack.path, resultXml);




        console.log(service_base);


        mkdirp.sync(service_base);


        var all_thens = [];
        if(service_meta.workflows && service_meta.workflows.length){
          mkdirp.sync(workflows_base);

          _.reduce(service_meta.workflows, function(thens, wf_title){
            var data = _.find(workflow_items, {title: wf_title});

            _.each(service_meta.interactions, function(inter){
              if(inter.key){
                _.each(inter.remappings, function(remap){
                  data.js = data.js.replace(
                    new RegExp(_.escapeRegExp("{{" + remap.remap_from + "-" + inter.key + "}}"), 'g'),
                    remap.remap_to);

                });
              }
            });


            var data_s = JSON.stringify(data);
            _.each(service_meta.parameters, function(param){
              if(param.expose){
                data_s = data_s.replace(
                  new RegExp(_.escapeRegExp("\\\"({{parameter:" + param.key + "}})\\\"" ), 'g'),
                  _.template("$engine.getServiceParameter('<%= service_name %>', '<%= param %>')")({service_name: name_key, param: param.key})
                );
              }else{
                data_s = data_s.replace(
                  new RegExp(_.escapeRegExp("({{parameter:" + param.key + "}})"), 'g'),
                  param.value);
              }

              

            });


            return thens.concat(fs.writeFileAsync(workflows_base + "/" + wf_title + ".wf", 
                                     data_s));
          }, all_thens);

        }

        console.log(name_key);


        // .parameters
        var params = _(service_meta.parameters).filter({expose: true}).indexBy('key').mapValues('value').value()
        if(service_meta.workflows && service_meta.workflows.length){
          params.workflows = package_name + "/" + name_key + ".workflows";
        }
        var param_file_content = yaml.dump(params);
        console.log('---------------- .parameters --------------------');
        console.log(param_file_content);

        console.log('---------------- .interactions --------------------');
        _.each(service_meta.interactions, function(i){
          i.parameters = _(i.parameters).indexBy('key').mapValues('value').value();
          delete i._id;
        });

        service_meta.interactions = _.map(service_meta.interactions, function(inter){
          return _.omit(inter, 'key');
        });

        console.log(yaml.dump(service_meta.interactions));


        console.log('---------------- .launcher --------------------');
        console.log(service_meta.launcher_body);

        console.log('---------------- .service --------------------');
        // .service
        var service_kv = _.pick(service_meta, "name description author priority interactions parameters launcher_type".split(/\s+/));
        service_kv.launcher = package_name + "/" + name_key;
        service_kv.interactions = package_name + "/" + name_key;
        service_kv.parameters = package_name + "/" + name_key;
        var service_file_content = yaml.dump(service_kv);
        console.log(service_file_content);

        // .workflows
        if(service_meta.workflows && service_meta.workflows.length){
          var workflows = _.map(service_meta.workflows, function(wfname){
            return {workflow: package_name + "/" + wfname + ".wf"};
          });
          var wf_thenable = fs.writeFileAsync(service_base + "/" + name_key + ".workflows", yaml.dump({workflows: workflows}));
          all_thens.push(wf_thenable);

        }

        // save icon

        all_thens = all_thens.concat([
          fs.writeFileAsync(service_base + "/" + name_key + ".parameters", param_file_content),
          fs.writeFileAsync(service_base + "/" + name_key + ".launch", service_meta.launcher_body),
          fs.writeFileAsync(service_base + "/" + name_key + ".service", service_file_content),
          fs.writeFileAsync(service_base + "/" + name_key + ".interactions", yaml.dump(service_meta.interactions))
        ]);


        return Promise.all(all_thens);

      })



      
    })
    .then(function(ok){
      return that.github.addCommitPushPR(title, description);

    })
    .catch(function(e){
      logger.error(e);

    });





};


module.exports = ServiceStore;
