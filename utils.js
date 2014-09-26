var fs = require('fs'),
  request = require('request'),
  zlib = require('zlib'),
  os = require('os'),
  rimraf = require('rimraf'),
  glob = require('glob'),
  tar = require('tar'),
  _ = require('lodash'),
  yaml = require('js-yaml');
  
  


module.exports = {

  retry: function(f, n, ms){
    var op = {};
    var remains = (n <= 0) ? Infinity : n;

    var f2 = function(){
      try{
        f();
      }catch(e){
        op.retry();
      }

    };

    op.retry = function(){
      if(remains-- <= 0) throw new Error('retry failed');
      _.delay(f2, ms);
    };

    _.defer(f2);

    return op;

  },

  extract_rapp_meta: function(url, callback){

    var dest = os.tmpdir() + "cento_authoring_rapp." + new Date().getTime();
    console.log(dest);
    gzstrm = request(url).pipe(zlib.createGunzip());
    gzstrm.on('error', callback);
    tarstrm = gzstrm.pipe(tar.Extract({
      path: dest
    }));
    tarstrm.on('end', function(){
      glob(dest + "/**/*interface", function(e, files){
        var data = _.map(files, function(f){
          var doc = yaml.safeLoad(fs.readFileSync(f, 'utf8'));
          return doc;
        });
        // clean
        rimraf.sync(dest);
        callback(null, data);



      });
    });




  }

}

