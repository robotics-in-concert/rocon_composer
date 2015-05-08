var _ = require('lodash'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  yaml = require('js-yaml');


/*
 * repo_base
 */

var Rapp = function(options){

};

Rapp.prototype.save = function(data){

  if(_.isEmpty(data.compatibility)){ delete data.compatibility; }
  if(_.isEmpty(data.parent_name)){ delete data.parent_name; }

  all_thens = [];



  var rapp_meta = _.pick(data, 'display', 'description', 'compatibility', 'parent_name');
  if(!_.isEmpty(data.parameters)){
    rapp_meta.parameters = data.name + ".parameters";
    var params = _(data.parameters).indexBy('key').mapValues('value').value();
    all_thens.push(fs.writeFileAsync(rapp_base + "/" + data.name + ".parameters",
                                     yaml.dump(params)));

  }


  if(!_.isEmpty(data.interfaces)){
    all_thens.push(fs.writeFileAsync(rapp_base + "/" + data.name + ".interfaces",
                                     yaml.dump(data.interfaces)));
    rapp_meta.interfaces = data.name + ".interfaces";

  }

  if(!_.isEmpty(data.launcher_body)){
    all_thens.push(fs.writeFileAsync(rapp_base + "/" + data.name + ".launch",
                                     yaml.dump(data.interfaces)));
    rapp_meta.launch = data.name + ".launch";

  }


  all_thens.push(fs.writeFileAsync(rapp_base + "/" + data.name + ".rapp",
                                   yaml.dump(rapp_meta)));


  all_thens = all_thens.concat([
    // fs.writeFileAsync(rapp_base + "/" + name_key + ".parameters", param_file_content),
    // fs.writeFileAsync(rapp_base + "/" + name_key + ".launch", service_meta.launcher_body),
    // fs.writeFileAsync(rapp_base + "/" + name_key + ".service", service_file_content),
    // fs.writeFileAsync(rapp_base + "/" + name_key + ".interactions", yaml.dump(service_meta.interactions))
  ]);

};

Rapp.prototype.keyed_interfaces = function(data){
  return _(data).groupBy('if')
    .omit('if')
    .value();

};


