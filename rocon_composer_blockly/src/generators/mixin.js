var Promise = require('bluebird'),
  _ = require('lodash'),
  glob = Promise.promisify(require('glob'));

GeneratorMixin = {
  ensure_repo_cloned: function(){
    var that = this;
    return new Promise(function(resolve, reject){
      fs.exists(that.repo_root, function(exists){
        console.log('here', exists);
        if(exists){
          resolve(exists);
        }else{
          that.github.sync_repo().then(function(repo){
            resolve();
            // return that.github.checkout(config.service_repo_branch);
          })
          // .then(function(){
          // resolve();
          // });
        }

      });

    });

  },

  packages: function(){
    
    var workdir = this.repo_root;

    return this.ensure_repo_cloned().then(function(){
      return glob(workdir + "/**/*.xml")
      .then(function(packs){
        console.log(packs);

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

    })
    .catch(function(e){
      logger.error("failed to get packages :", e, e.stack);

    });


  }

}


module.exports = GeneratorMixin;
