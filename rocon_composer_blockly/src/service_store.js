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
  Settings = require('./model').Settings,
  mkdirp = require('mkdirp');
  // ServiceStore = require('./service_store');
  

var ServiceStore = function(options){
  // options
  // - ros_root
  this.options = options;
  this.repo_root = Path.join(os.tmpdir(), "service_repository");


  this.remoteCallbacks = {
    certificateCheck: function() { return 1; },
    credentials: function() {
      return nodegit.Cred.userpassPlaintextNew(config.github_token, "x-oauth-basic");
    }
  };

};



ServiceStore.prototype._withRepo = function(){
  var repo_root = this.repo_root;
  var that = this;
  console.log("tmp repo root", repo_root);

  var remoteCallbacks = this.remoteCallbacks;

  return nodegit.Repository.open(repo_root)
    .catch(function(e){
      var repo_url = "https://github.com/"+config.service_repo+".git";
      console.log(repo_url);

      return nodegit.Clone(
        repo_url,
        repo_root,
        {remoteCallbacks: remoteCallbacks}).catch(function(e){
          logger.error('clone failed', e);


        })
        .then(function(repo){
           return nodegit.Remote.create(repo, "upstream",
                "https://github.com/"+config.service_repo_base+".git")
               .then(function(){
                 return repo;
               });
              
            })

    })
    .then(function(repo){
      var bra = config.service_repo_branch;
      return repo.fetchAll(that.remoteCallbacks)
        .then(function(){
          console.log('merge ', bra);
          return repo.getBranchCommit('upstream/'+bra);
        })
        .then(function(commit){
          console.log(commit.sha());
          if(bra == "master"){
            return repo.mergeBranches("master", "upstream/master");
          }
          return repo.createBranch(bra, commit, 1, repo.defaultSignature(), "new branch");



          // return repo;
        }).then(function(){
          return repo;
          
        });



    });


};
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
  return this._withRepo()
    .then(function(repo){
      var workdir = repo.workdir();
      return glob(workdir + "/**/*.xml")
    })
    .then(function(packs){
      return Promise.resolve(packs)
        .map(function(xmlpath){
          return fs.readFileAsync(xmlpath).then(function(xml){
            return xml2js.parseStringAsync(xml, {explicitArray: false});
          })
          .then(function(item){
            item = item.package;
            item.path = xmlpath;
            return item;

          });

        })

    })
    // .then(function(re){ logger.debug(re); return re; })
    .catch(function(e){

      logger.error("failed to get packages :", e, e.stack);

    });

};


ServiceStore.prototype._createPullRequest = function(branch_name, title, description){
  logger.info('PR : ', branch_name);

  return new Promise(function(resolve, reject){
    var head = config.service_repo.split("/")[0] + ":" + branch_name;
    var data = {title: title, head: head, base: config.service_repo_branch, body: description}
    logger.info('PR : ', data);
    request.post('https://api.github.com/repos/' + config.service_repo_base + "/pulls")
      .set('Authorization', "token "+config.github_token) 
      .type('json')
      .send(data)
      .end(function(e, res){
        if(e){
          console.log("PR - E", e);

          reject(e);
        } else {
          console.log('PR - OK');

          resolve(res);
        }

      });

  });

};

ServiceStore.prototype._pushRepo = function(repo, ref){
  console.log(ref);
  console.log(ref+":"+ref);



  var that = this;
  return nodegit.Remote.lookup(repo, 'origin')
    .then(function(origin){
      origin.setCallbacks(that.remoteCallbacks);

      logger.info("origin", origin);
      return origin.push(
        [ref+":"+ref],
        null,
        repo.defaultSignature(),
        "Push");



    })
    .catch(function(e){
      logger.error('failed to push', e);
      
    });
};
ServiceStore.prototype._createBranch = function(repo){
  var new_branch_name = 'new-branch-'+(new Date().getTime());
  var base_commit = null;
  return repo.getBranchCommit(config.service_repo_branch)
    .then(function(commit){
      return repo.createBranch(new_branch_name, commit);
      // return repo.createBranch(new_branch_name, commit, 0, 
                               // repo.defaultSignature(), 'Created new barnch - '+new_branch_name);
    })
};


ServiceStore.prototype._addAllToIndex = function(repo){
  return repo.openIndex()
    .then(function(index){
      index.read(1)
      return index.addAll()
        .then(function(){
          index.write();
        })
        .then(function(){
          return index.writeTree();
        })
    });

};


ServiceStore.prototype._commitRepo = function(title, description){
  logger.info("commit", title, description)
  var that = this;
  // var index = null;

  return this._withRepo().then(function(repo){
      that._createBranch(repo)
        .then(function(branch){



          repo.checkoutBranch(branch).then(function(){
            that._addAllToIndex(repo)
              .then(function(oid){
                return repo.getBranchCommit(config.service_repo_branch)
                  .then(function(commit){
                    logger.info('1')
                    logger.info(branch.toString());
                    var author = nodegit.Signature.now("Eunsub Kim", "eunsub@gmail.com");

                    logger.info('3')
                    return repo.createCommit(branch.name(), author, author, 
                                             "updated "+(new Date()), 
                                             oid, [commit])

                  })
                  .then(function(){
                    logger.info('2', branch.name())
                    return that._pushRepo(repo, branch)
                      .then(function(){

                        return that._createPullRequest(branch.name().split("/")[2], title, description);

                      });

                  });
                });

              })








            });
      })

};

ServiceStore.prototype.exportToROS = function(title, description, service_meta, package_name){
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

            _.each(service_meta.parameters, function(param){
              if(param.expose){
                data.js = data.js.replace(
                  new RegExp(_.escapeRegExp("{{parameter:" + param.key + "}}"), 'g'),
                  _.template("$engine.getServiceParameter('<%= service_name %>', '<%= param %>')")({service_name: name_key, param: param.key})
                );
              }else{
                data.js = data.js.replace(
                  new RegExp(_.escapeRegExp("{{parameter:" + param.key + "}}"), 'g'),
                  param.value);
              }

              

            });


            return thens.concat(fs.writeFileAsync(workflows_base + "/" + wf_title + ".wf", 
                                     JSON.stringify(data)));
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
      // return that._commitRepo(title, description);
      return true;
      

    })
    .catch(function(e){
      logger.error(e);

    });





};


module.exports = ServiceStore;
