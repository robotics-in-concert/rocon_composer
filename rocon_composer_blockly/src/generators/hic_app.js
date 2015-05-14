var _ = require('lodash'),
  Path = require('path'),
  yaml = require('js-yaml'),
  GeneratorMixin = require('./mixin'),
  GithubRepo = require('../github_repository');


/*
 * repo_base
 */

var HicApp = function(options){
  this.repo_root = Path.join(os.tmpdir(), "hic_apps_repository");
  this.github = new GithubRepo({
    repo_root: this.repo_root,
    working_repo: config.hic_app_repo,
    base_repo: config.hic_app_repo_base,
    working_branch: config.hic_app_repo_branch,
    github_token: config.github_token
  });


};

_.extend(HicApp.prototype, GeneratorMixin);

HicApp.prototype.save = function(params){
  var that = this;
  return this.github.sync_repo().then(function(){
    console.log('SAVE hicapp');

      var data = params.data;
      var base = Path.join(that.repo_root, config.hic_app_repo_path);
      mkdirp.sync(base);


      var fn = data.filename;
      delete data.filename;
      return fs.writeFileAsync(base + "/" + fn + ".hic_app", yaml.dump(data))
    }).then(function(){
      var new_branch_name = 'new-branch-'+(new Date().getTime());
      return that.github.create_branch(config.hic_app_repo_branch, new_branch_name).then(function(branch){
        return that.github.checkout(new_branch_name).then(function(){
          return that.github.addCommitPushPR(params.title, params.description);
        });
      });

    }).catch(function(e){
      console.log('error', e, e.stack);

      
    });;


};

module.exports = HicApp;
