var _ = require('lodash'),
  UUID = require('node-uuid'),
  EventEmitter2 = require('eventemitter2').EventEmitter2;

var ResourceManager = function(ros){
  this.ros = ros;
  EventEmitter2.call(this, {wildcard: true});

  this.resources = {}; // thenables
  this.ref_counts = {};

};
util.inherits(ResourceManager, EventEmitter2);


ResourceManager.prototype.release = function(requester_id){
  var that = this;
  this.emit('releasing');

  var res = _.find(this.resources, {rid: requester_id});
  var key = res.key;
  var requester = res.requester;
  return requester.cancel_all().then(function(){
    delete that.resources[key];
    that.emit('released');
  });
};


ResourceManager.prototype.ref_counted_release = function(req_id){
  var that = this;
  this.resources[req_id].then(function(ctx){

    if(!ctx.allocation_type || ctx.allocation_type == 'dynamic'){
      that.change_ref_count(req_id, -1);
      if(that.ref_count[ctx.req_id] <= 0){
        that.release(req_id);
      }
    }

  });


};
ResourceManager.prototype.change_ref_count = function(req_id, delta){
  if(!this.ref_counts[req_id]){
    this.ref_counts[req_id] = 0;
  }

  this.ref_counts[req_id] = this.ref_counts[req_id] + delta;
  logger.debug('ref count change : ', req_id, delta);
  this.emit('change_ref_count');
};

ResourceManager.prototype.allocate = function(key, rapp, uri, remappings, parameters, options){ 
  var that = this;

  if(!key){
    key = UUID.v4();
  }


  var resource = that.resources[key];
  var allocation_type = options.type || 'dynamic';

  if(_.isEmpty(resource)){
    this.emit('allocation_started');
    var r = new Requester(this.ros);
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

    var thenable = r.send_allocation_request(res, {timeout: options.timeout}).then(function(reqId){
      if(allocation_type == 'dynamic'){
        that.change_ref_count(rid, 1);
      }
      that.emit('allocated');
      var ctx = {req_id: rid, remappings: remappings, parameters: parameters, rapp: rapp, uri: uri, allocation_type: options.type, key: key};
      return ctx;
    }).catch(function(e){
      that.emit('allocation_failed');
      return null;
    });

    // that.requesters[rid] = r;
    that.resources[key] = {
      key: key,
      thenable: thenable,
      requester: r,
      rid: rid,
      requester_id: rid
    };
    that.emit('allocating');

    resource = that.resources[key];

  }

  return resource.thenable;
};


ResourceManager.prototype.to_json = function(){
  var that = this;
  var payload = _(this.resources)
    .map(function(v, k){ 
      v = v.requester;

      var srequests = v.requests;

      var requests = _.map(srequests.requests, function(req){
        var keys = "status availability priority reason problem hold_time".split(/ /);
        var kv = _.pick(req, keys);

        var resources = _.map(req.resources, function(res){
          var r = _.cloneDeep(res);
          r.id = res.id.toString();
          return r;
        });

        return _.assign(kv, {id: req.id.toString(), resources: resources});
      });

      return {
        requester: v.id.toString(),
        ref_count: that.ref_counts[v.id.toString()],
        requests: requests
      }
    })
    .value();
  console.log("RESRES", payload);

  return payload;
};

module.exports = ResourceManager;
