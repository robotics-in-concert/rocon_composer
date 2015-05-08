var _ = require('lodash');


/*
 * repo_base
 */

var HicApp = function(options){

};

HicApp.prototype.save = function(data){
  all_thens = [];
  all_thens = all_thens.concat([
    // fs.writeFileAsync(rapp_base + "/" + name_key + ".parameters", param_file_content),
    // fs.writeFileAsync(rapp_base + "/" + name_key + ".launch", service_meta.launcher_body),
    // fs.writeFileAsync(rapp_base + "/" + name_key + ".service", service_file_content),
    // fs.writeFileAsync(rapp_base + "/" + name_key + ".interactions", yaml.dump(service_meta.interactions))
  ]);

};

HicApp.prototype.keyed_interfaces = function(data){
  return _(data).groupBy('if')
    .omit('if')
    .value();

};
