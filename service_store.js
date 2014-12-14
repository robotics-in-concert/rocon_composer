var  R = require('ramda'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  xml2js = Promise.promisifyAll(require('xml2js'));

var ServiceStore = function(options){
  // options
  // - ros_root
  this.options = options;

};


ServiceStore.prototype.allPackageInfos = function(){
  return glob(this.options.ros_root + "/**/package.xml")
    .map(function(xmlpath){
      return fs.readFileAsync(xmlpath).then(function(xml){
        return xml2js.parseStringAsync(xml, {explicitArray: false});
      })
      .then(function(item){
        item.path = xmlpath;
        return item;

      });

    })


};

ServiceStore.prototype.exportToROS = function(){
  this.allPackageInfos().then(function(res){ console.log(res); console.log('done'); });
  return

  glob(this.options.ros_root + "/**/package.xml", function(e, packagexml_path){

    R.map(function(package_xml){
      package_info = xml2js.parseString(fs.readFileSync(package_xml), {explicitArray: false}, function(e, data){
        console.log(data);


      });

    })(packagexml_path);

  })

};


module.exports = ServiceStore;
