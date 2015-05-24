
var _ = require('lodash'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  os = require('os'),
  Path = require('path'),
  yaml = require('js-yaml'),
  nodegit = require('nodegit'),
  request = require('superagent'),
  Settings = require('./model').Settings,
  mkdirp = require('mkdirp');

/* options
 *
 * repo_root
 * working_repo
 * base_repo
 * working_branch
 * github_token
 * signature_name (optional)
 * signature_email (optional)
 */
var GithubRepository = function(options){
  this.options = options;
  this.remoteCallbacks = {
    certificateCheck: function() { return 1; },
    credentials: function() {
      return nodegit.Cred.userpassPlaintextNew(config.github_token, 'x-oauth-basic');
    }
  };
};



GithubRepository.prototype.sync_repo = function(clean){
  var repo_root = this.options.repo_root;
  var that = this;
  var options = this.options
  logger.info('tmp repo root'+ repo_root);

  var remoteCallbacks = this.remoteCallbacks;

  return nodegit.Repository.open(repo_root)
    .catch(function(e){
      var repo_url = 'https://github.com/'+options.working_repo+'.git';
      logger.info('clone repo_url: '+ repo_url);
      return nodegit.Clone(
        repo_url,
        repo_root,
        {remoteCallbacks: remoteCallbacks,
         //checkoutBranch: options.working_branch
        }).catch(function(e){logger.error('Clone failed: '+ e);})
        .then(function(repo){
          that.repo = repo;
           return nodegit.Remote.create(repo, 'upstream',
                'https://github.com/'+options.base_repo+'.git')
               .then(function(){
                 return repo;
               });
        })
    })
    .then(function(repo){
      return that.pull(repo, 'upstream', options.working_branch)
      .then(function(){
        that.repo = repo;
        return repo;
      }).catch(function(e){logger.error('[err] git pull: ' + e);});
    });
};

GithubRepository.prototype.checkout = function(branch){
  logger.info('change working branch into ', branch);
  return this.repo.checkoutBranch(branch,{
    checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE
  });
};

GithubRepository.prototype.pull = function(repo, remote, branch){
   var that = this;
   return repo.fetchAll(that.remoteCallbacks)
    .then(function(){
      return repo.getBranchCommit(remote + '/' + branch);
    }).catch(function(e){logger.error('[err] fetchAll: ' + e);})
    .then(function(commit){
      return repo.createBranch(branch, commit, 1, repo.defaultSignature(), 'new branch');
    }).catch(function(e){
      logger.error('[err] getBranchCommit: ' + e);
      return repo;
    })
    .then(function(){
      return that.checkout(branch);
    }).catch(function(e){
      logger.error('[err] createBranch: ' + e);
      return that.checkout(branch);
    })
    .then(function(){
      return repo;
    }).catch(function(e){
      logger.error('[err] checkoutBranch: ' + e);
      return repo;
    })
};

GithubRepository.prototype.create_pull_request = function(branch_name, title, description){
  var opt = this.options;

  return new Promise(function(resolve, reject){
    var head = opt.working_repo.split('/')[0] + ':' + branch_name;
    var data = {title: title, head: head, base: opt.working_branch, body: description}
    logger.info('PR URL: '+ 'https://api.github.com/repos/' + opt.base_repo + '/pulls');
    logger.info('PR DATA: ', data);
    request.post('https://api.github.com/repos/' + opt.base_repo + '/pulls')
      .set('Authorization', 'token '+opt.github_token) 
      .type('json')
      .send(data)
      .end(function(e, res){
        e ? reject(e) : resolve(res);
      });

  });

};

GithubRepository.prototype.push = function(ref){
  var repo = this.repo;

  var that = this;
  return nodegit.Remote.lookup(repo, 'origin')
    .then(function(origin){
      origin.setCallbacks(that.remoteCallbacks);

      logger.info('origin', origin, ref + ':' + ref);
      return origin.push(
        [ref+':'+ref],
        null,
        repo.defaultSignature(),
        'Push');

    })
    .catch(function(e){
      logger.error('failed to push'+ e);
      
    });
};


GithubRepository.prototype.create_branch = function(base, branch_name){
  var that = this;
  return that.repo.getBranchCommit(base)
    .then(function(commit){
      return that.repo.createBranch(branch_name, commit);
    });

};

GithubRepository.prototype.add_all_to_index = function(){

  return this.repo.openIndex()
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




GithubRepository.prototype.addCommitPushPR = function(title, description){
  var that = this;
  var opts = this.options;
  var repo = that.repo;

  repo.getCurrentBranch().then(function(branch_ref){
    var branch_name = branch_ref.name();
    return that.add_all_to_index()
      .then(function(oid){
        return repo.getBranchCommit(opts.working_branch)
          .then(function(commit){
            var author = that.repo.defaultSignature()
            return repo.createCommit(branch_name, author, author, 
                                     'updated '+(new Date()), 
                                     oid, [commit])

          }).catch(function(e){logger.error('[err] getBranchCommit: ' + e)})
          .then(function(){
            return that.push(branch_name)
          }).catch(function(e){logger.error('[err] push: ' + e)})
          .then(function(){
            return that.create_pull_request(branch_name.split('/')[2], title, description);
          }).catch(function(e){logger.error('[err] create_pull_request: ' + e)});
        });
  });
};

module.exports = GithubRepository;
