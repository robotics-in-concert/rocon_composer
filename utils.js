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

