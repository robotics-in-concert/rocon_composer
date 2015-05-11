var _ = require('lodash'),message
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  os = require('os'),
  mkdirp = require('mkdirp'),
  xml2js = Promise.promisifyAll(require('xml2js')),
  GithubRepo = require('./github_repository'),
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


Rapp.prototype.generate_content = function(_data){
  var data = _.clone(_data);
  if(_.isEmpty(data.compatibility)){ delete data.compatibility; }
  if(_.isEmpty(data.parent_name)){ delete data.parent_name; }

  var results = {};

  var rapp_meta = _.pick(data, 'display', 'description', 'compatibility', 'parent_name');
  if(!_.isEmpty(data.parameters)){
    rapp_meta.parameters = data.name + ".parameters";
    var params = _(data.parameters).indexBy('key').mapValues('value').value();
    results[data.name + '.parameters'] = yaml.dump(params);
  }

  if(!_.isEmpty(data.interfaces)){
    results[data.name + ".interfaces"] = yaml.dump(data.interfaces);
    rapp_meta.interfaces = data.name + ".interfaces";
  }

  if(!_.isEmpty(data.launcher_body)){
    results[data.name + ".launch"] = yaml.dump(data.launcher_body);
    rapp_meta.launch = data.name + ".launch";
  }

  results[data.name + ".rapp"] = yaml.dump(rapp_meta);

  logger.debug(results);
  return results;
};

Rapp.prototype.save = function(title, description, data, package_name){
  var that = this;
  return this.github.sync_repo().then(function(repo){


    return that.packages().then(function(packs){


      var pack = _.find(packs, {name: package_name});
      var name_key = data.name.replace(/\s+/g, "_").toLowerCase();
      var rapp_base = Path.join( Path.dirname(pack.path), "rapp", name_key);

      mkdirp.sync(rapp_base);


      var files = that.generate_content(data);
      var all_thens = _.map(files, function(body, fn){
        return fs.writeFileAsync(rapp_base + "/" + fn, body);
      });


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
