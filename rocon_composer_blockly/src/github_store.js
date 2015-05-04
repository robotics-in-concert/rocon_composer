
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
  // GithubStore = require('./service_store');
  

var GithubStore = function(options){
  this.options = options;


  this.remoteCallbacks = {
    certificateCheck: function() { return 1; },
    credentials: function() {
      return nodegit.Cred.userpassPlaintextNew(config.github_token, "x-oauth-basic");
    }
  };

};



GithubStore.prototype._withRepo = function(){
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

GithubStore.prototype._createPullRequest = function(branch_name, title, description){
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

GithubStore.prototype._pushRepo = function(repo, ref){
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
GithubStore.prototype._createBranch = function(repo){
  var new_branch_name = 'new-branch-'+(new Date().getTime());
  var base_commit = null;
  return repo.getBranchCommit(config.service_repo_branch)
    .then(function(commit){
      return repo.createBranch(new_branch_name, commit);
      // return repo.createBranch(new_branch_name, commit, 0, 
                               // repo.defaultSignature(), 'Created new barnch - '+new_branch_name);
    })
};


GithubStore.prototype._addAllToIndex = function(repo){
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


GithubStore.prototype._commitRepo = function(title, description){
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

