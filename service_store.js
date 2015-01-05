var  R = require('ramda'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  xml2js = Promise.promisifyAll(require('xml2js')),
  libxml = require('libxmljs'),
  exec = Promise.promisify(require('child_process').exec),
  Path = require('path'),
  yaml = require('js-yaml'),
  mkdirp = require('mkdirp');
  // ServiceStore = require('./service_store');
  

var ServiceStore = function(options){
  // options
  // - ros_root
  this.options = options;

};


var _to_colon_sep = function(obj){
  return R.compose(
    R.join("\n"),
    R.map(R.join(": ")),
    R.toPairs
  )(obj);
};

ServiceStore.prototype.allPackageInfos = function(){
  return exec("rospack list").spread(function(stdout, stderr){
    var lines = R.reject(R.isEmpty, stdout.split(/\n/));
    var packs = R.map(function(l){ return l.split(/\s/)[1] + "/package.xml"; })(lines);
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


  });


};

ServiceStore.prototype.exportToROS = function(package_name, service_meta, package_name){
  return this.allPackageInfos().then(function(packages){ 
    console.log(service_meta);
    console.log(package_name);
    var pack =  R.find(R.propEq('name', package_name))(packages);


    var name_key = service_meta.name.replace(/\s+/g, "_").toLowerCase();
    var service_base = Path.join( Path.dirname(pack.path), "services", name_key);


    var xml = fs.readFileSync(pack.path)
    var xmlDoc = libxml.parseXmlString(xml);

    var node = xmlDoc.get('//export');
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
  });




};


module.exports = ServiceStore;
