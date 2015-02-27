var _ = require('lodash'),
  UUID = require('node-uuid'),
  EventEmitter2 = require('eventemitter2').EventEmitter2;

var ResourceManager = function(engine){
  this.engine = engine;
  EventEmitter2.call(this, {wildcard: true});

  this.resources = {}; // thenables

};
util.inherits(ResourceManager, EventEmitter2);


ResourceManager.prototype.allocate = function(key, rapp, uri, remappings, parameters, options){ 
  var that = this;

  if(!key){
    key = UUID.v4();
  }


  var resource = that.resources[key];

  if(_.isEmpty(resource)){
    var r = new Requester(this.engine);
    var rid = r.id.toString();

    _.each(remappings, function(remap){
      if(_.isEmpty(remap.remap_to)){
        remap.remap_to = "/" + remap.remap_from + "_" + UUID.v4().replace(/-/g, "");
      }
    });

    var res = new Resource();
    res.rapp = rapp;
    res.uri = uri;
    res.remappings = remappings;
    res.parameters = parameters;

    resource = r.send_allocation_request(res, {timeout: options.timeout, test: true}).then(function(reqId){
      var ctx = {req_id: rid, remappings: remappings, parameters: parameters, rapp: rapp, uri: uri, allocation_type: options.type, key: key};
      return ctx;
    });
    that.resources[key] = resource;

  }

  return resource;
};



module.exports = ResourceManager;
