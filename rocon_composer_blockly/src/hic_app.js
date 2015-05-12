var _ = require('lodash'),
  Path = require('path'),
  yaml = require('js-yaml'),
  GithubRepo = require('./github_repository');


/*
 * repo_base
 */

var HicApp = function(options){
  this.repo_base = Path.join(os.tmpdir(), "hic_apps_repository");
  this.github = new GithubRepo({
    repo_root: this.repo_base,
    working_repo: config.hic_app_repo,
    base_repo: config.hic_app_repo_base,
    working_branch: config.hic_app_repo_branch,
    github_token: config.github_token
  });


};

HicApp.prototype.save = function(params){
  var that = this;
  return this.github.sync_repo().then(function(repo){
    var data = params.data;
    var base = Path.join(that.repo_base, config.hic_app_repo_path);
    mkdirp.sync(base);


    var fn = data.filename;
    delete data.filename;
    return fs.writeFileAsync(base + "/" + fn + ".hic_app", yaml.dump(data))
  }).then(function(){
    return that.github.addCommitPushPR(params.title, params.description);
  }).catch(function(e){
    console.log('error', e);

    
  });;

};

HicApp.prototype.keyed_interfaces = function(data){
  return _(data).groupBy('if')
    .omit('if')
    .value();

};


module.exports = HicApp;
