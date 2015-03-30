var  R = require('ramda'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  xml2js = Promise.promisifyAll(require('xml2js')),
  libxml = require('libxmljs'),
  os = require('os'),
  exec = Promise.promisify(require('child_process').exec),
  Path = require('path'),
  yaml = require('js-yaml'),
  nodegit = require('nodegit'),
  mkdirp = require('mkdirp');
  // ServiceStore = require('./service_store');
  

var ServiceStore = function(options){
  // options
  // - ros_root
  this.options = options;
  this.repo_root = Path.join(os.tmpdir(), "service_repository");

};


var _to_colon_sep = function(obj){
  return R.compose(
    R.join("\n"),
    R.map(R.join(": ")),
    R.toPairs
  )(obj);
};



ServiceStore.prototype._withRepo = function(){
  var repo_root = this.repo_root;
  console.log("tmp repo root", repo_root);



  return nodegit.Repository.open(repo_root)
    .catch(function(e){

      return nodegit.Clone(
        process.env.ROCON_COMPOSER_BLOCKLY_SERVICE_REPO,
        repo_root,
        {
          remoteCallbacks: {
            certificateCheck: function() {
              // github will fail cert check on some OSX machines
              // this overrides that check
              return 1;
            }
          }
        }).catch(function(e){
          logger.error('clone failed', e);


        });

    });


};

ServiceStore.prototype.allPackageInfos = function(){
  return this._withRepo()
    .then(function(repo){
      var workdir = repo.workdir();
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
    // .then(function(re){ logger.debug(re); return re; })
    .catch(function(e){
      logger.error(e);

    });

};

ServiceStore.prototype._commitRepo = function(){
  // todo 

};

ServiceStore.prototype.exportToROS = function(package_name, service_meta, package_name){
  return this.allPackageInfos()
    .then(function(packages){ 
      console.log(packages);

      console.log(service_meta);
      console.log(package_name);
      console.log('here');

      var pack = _.find(packages, {name: package_name});
      console.log("PACK", pack);


      var name_key = service_meta.name.replace(/\s+/g, "_").toLowerCase();
      var service_base = Path.join( Path.dirname(pack.path), "services", name_key);


      var xml = fs.readFileSync(pack.path)
      var xmlDoc = libxml.parseXmlString(xml);

      var package = xmlDoc.get('/package');

      var node = package.get('//export');
      if(!node){
        node = package.node('export');
      }

      node.node('concert_service', Path.join('services', name_key, name_key+'.service'));

      var resultXml = xmlDoc.toString(true);

      fs.writeFileSync(pack.path, resultXml);




      console.log(service_base);


      mkdirp.sync(service_base);

      console.log(name_key);


      // .parameters
      var params = R.compose(
        R.tap(console.log),
        R.fromPairs,
        R.map(R.props(['key', 'value']))
      )(service_meta.parameters);
      var param_file_content = _to_colon_sep(params);
      console.log('---------------- .interactions --------------------');
      R.forEach(function(i){
        i.parameters = R.fromPairs(R.map(R.values)(i.parameters));
      })(service_meta.interactions);


      console.log(yaml.dump(service_meta.interactions));

      console.log('---------------- .parameters --------------------');
      console.log(param_file_content);

      console.log('---------------- .launcher --------------------');
      console.log(service_meta.launcher.launcher_body);

      // .service
      var service_kv = R.pickAll("name description author priority interactions parameters".split(/\s+/), service_meta);
      service_kv.launcher_type = service_meta.launcher.launcher_type
      service_kv.launcher = name_key + ".launcher";
      // service_kv.icon = name_key + ".icon";
      service_kv.interactions = name_key + ".interactions";
      service_kv.parameters = name_key + ".parameters";
      var service_file_content = _to_colon_sep(service_kv);
      console.log('---------------- .service --------------------');
      console.log(service_file_content);


      // save icon

      return Promise.all([
        fs.writeFileAsync(service_base + "/" + name_key + ".parameters", param_file_content),
        fs.writeFileAsync(service_base + "/" + name_key + ".launcher", service_meta.launcher.launcher_body),
        fs.writeFileAsync(service_base + "/" + name_key + ".service", service_file_content),
        fs.writeFileAsync(service_base + "/" + name_key + ".interactions", yaml.dump(service_meta.interactions))
      ]);


      return Promise.resolve(true);
    })
    .then(function(ok){

    });




};


module.exports = ServiceStore;
