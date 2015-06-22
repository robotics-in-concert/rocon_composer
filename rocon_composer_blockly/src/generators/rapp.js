var _ = require('lodash'),message
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  os = require('os'),
  mkdirp = require('mkdirp'),
  xml2js = Promise.promisifyAll(require('xml2js')),
  libxml = require('libxmljs'),
  vkbeautify = require('vkbeautify'),
  GithubRepo = require('../github_repository'),
  Path = require('path'),
  GeneratorMixin = require('./mixin'),
  yaml = require('js-yaml');



/*
 * repo_base
 */

var Rapp = function(options){
  this.repo_root = Path.join(os.tmpdir(), "rapp_repository");
  this.github = new GithubRepo({
    repo_root: this.repo_root,
    working_repo: config.rapp_repo,
    base_repo: config.rapp_repo_base,
    working_branch: config.rapp_repo_branch,
    github_token: config.github_token
  });
};

_.extend(Rapp.prototype, GeneratorMixin);

Rapp.prototype.generate_content = function(_data){
  var data = _.clone(_data);
  if(_.isEmpty(data.compatibility)){ delete data.compatibility; }
  if(_.isEmpty(data.parent_name)){ delete data.parent_name; }

  var results = {};

  var rapp_meta = _.pick(data, 'display', 'description', 'compatibility', 'parent_name');
  
  if(!_.isEmpty(data.public_parameter)){
    rapp_meta.public_parameter = data.name + ".parameters";
    var params = _(data.public_parameter).indexBy('key').mapValues('value').value();
    results[data.name + '.parameters'] = yaml.dump(params);
  }

  if(!_.isEmpty(data.public_interface)){
    results[data.name + ".interface"] = yaml.dump(data.public_interface);
    rapp_meta.public_interface = data.name + ".interface";
  }

  if(!_.isEmpty(data.launcher_body)){
    results[data.name + ".launch"] = data.launcher_body;
    rapp_meta.launch = data.name + ".launch";
  }

  results[data.name + ".rapp"] = yaml.dump(rapp_meta);
  logger.debug(results);
  return results;
};


Rapp.prototype.addExportTag = function(pkg_path, name_key){
  var xml = fs.readFileSync(pkg_path)
  var xmlDoc = libxml.parseXmlString(xml);
  var package = xmlDoc.get('/package');

  var node = package.get('//export');
  if(!node){
   node = package.node('export');
  }
  var node_val = Path.join('rapps', name_key, name_key+'.rapp');
  
  var exists = node.get("//rocon_app[text()='"+node_val+"']")
  if(!exists){
    node.node('rocon_app', node_val);
  }

  var resultXml = xmlDoc.toString(true);
  resultXml = vkbeautify.xml(resultXml);
  fs.writeFileSync(pkg_path, resultXml);
}

Rapp.prototype.save = function(title, description, data, package_name){
  var that = this;
  return that.github.sync_repo().then(function(){
    var new_branch_name = 'new-branch-'+(new Date().getTime());
    logger.log("[SUCCESS] sync repo");
    return that.github.create_branch(config.rapp_repo_branch, new_branch_name).then(function(branch){
      logger.log("[SUCCESS] create_branch");
      return that.github.checkout(new_branch_name).then(function(){
        logger.log("[SUCCESS] checkout");
        return that.packages().then(function(packages){
          logger.log("[SUCCESS] get packages: " + packages);
          var pack = _.find(packages, {name: package_name});
          var name_key = data.name.replace(/\s+/g, "_").toLowerCase();
          var rapp_base = Path.join( Path.dirname(pack.path), "rapp", name_key);
          that.addExportTag(pack.path, name_key);
          mkdirp.sync(rapp_base);
          var files = that.generate_content(data);
          var all_thens = _.map(files, function(body, fn){
            return fs.writeFileAsync(rapp_base + "/" + fn, body);
          });
          return Promise.all(all_thens).then(function(){
              return that.github.addCommitPushPR(title, description);
          }).catch(function(e){logger.error("[ERR]generate content: " + e);});
        }).catch(function(e){logger.error("[ERR]get packages: " + e);});
      }).catch(function(e){logger.error("[ERR]checkout: " + e);});
    }).catch(function(e){logger.error("[ERR]create_branch: " + e);});
  }).catch(function(e){logger.error("[ERR]sync_repo: " + e);});

};

Rapp.prototype.keyed_interfaces = function(data){
  return _(data).groupBy('if')
    .omit('if')
    .value();

};



module.exports = Rapp;
