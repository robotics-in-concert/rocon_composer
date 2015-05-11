var _ = require('lodash'),message
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  os = require('os'),
  mkdirp = require('mkdirp'),
  xml2js = Promise.promisifyAll(require('xml2js')),
  GithubRepo = require('./github_store'),
  Path = require('path'),
  yaml = require('js-yaml');


/*
 * repo_base
 */

var Rapp = function(options){
  this.repo_base = Path.join(os.tmpdir(), "rapp_repository");
  this.github = new GithubRepo({
    repo_root: this.repo_base,
    working_repo: config.rapp_repo,
    base_repo: config.rapp_repo_base,
    working_branch: config.rapp_repo_branch,
    github_token: config.github_token
  });

};


Rapp.prototype.packages = function(){
  return this.github.sync_repo()
    .then(function(repo){
      var workdir = repo.workdir();
      console.log(repo.workdir());
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
    .catch(function(e){
      logger.error("failed to get packages :", e, e.stack);

    });

};

Rapp.prototype.save = function(title, description, data, package_name){
  var that = this;
  return this.github.sync_repo().then(function(repo){


    return that.packages().then(function(packs){



      if(_.isEmpty(data.compatibility)){ delete data.compatibility; }
      if(_.isEmpty(data.parent_name)){ delete data.parent_name; }

      all_thens = [];




      var pack = _.find(packs, {name: package_name});
      console.log(pack);
      console.log(data);

      var name_key = data.name.replace(/\s+/g, "_").toLowerCase();
      console.log(name_key);

      var rapp_base = Path.join( Path.dirname(pack.path), "rapp", name_key);
      console.log(rapp_base);

      mkdirp.sync(rapp_base);


      var rapp_meta = _.pick(data, 'display', 'description', 'compatibility', 'parent_name');
      if(!_.isEmpty(data.parameters)){
      console.log('-=0==-=-=--------------');
        rapp_meta.parameters = data.name + ".parameters";
        var params = _(data.parameters).indexBy('key').mapValues('value').value();
        all_thens.push(fs.writeFileAsync(rapp_base + "/" + data.name + ".parameters",
                                         yaml.dump(params)));

      }

      console.log('--------------');

      console.log(rapp_meta);


      if(!_.isEmpty(data.interfaces)){
        all_thens.push(fs.writeFileAsync(rapp_base + "/" + data.name + ".interfaces",
                                         yaml.dump(data.interfaces)));
        rapp_meta.interfaces = data.name + ".interfaces";

      }

      if(!_.isEmpty(data.launcher_body)){
        all_thens.push(fs.writeFileAsync(rapp_base + "/" + data.name + ".launch",
                                         yaml.dump(data.launcher_body)));
        rapp_meta.launch = data.name + ".launch";

      }


      console.log('HERE!!!!!!!');



      all_thens.push(fs.writeFileAsync(rapp_base + "/" + data.name + ".rapp",
                                       yaml.dump(rapp_meta)));


      all_thens = all_thens.concat([
        // fs.writeFileAsync(rapp_base + "/" + name_key + ".parameters", param_file_content),
        // fs.writeFileAsync(rapp_base + "/" + name_key + ".launch", service_meta.launcher_body),
        // fs.writeFileAsync(rapp_base + "/" + name_key + ".service", service_file_content),
        // fs.writeFileAsync(rapp_base + "/" + name_key + ".interactions", yaml.dump(service_meta.interactions))
      ]);
      return Promise.all(all_thens);


    }).then(function(){
      return that.github.addCommitPushPR(title, description);
    });


  });




};

Rapp.prototype.keyed_interfaces = function(data){
  return _(data).groupBy('if')
    .omit('if')
    .value();

};



module.exports = Rapp;
