var spawn = require('child_process').spawn,
  _ = require('lodash'),
  Promise = require('bluebird'),
  util = require('util'),
  Settings = require('./model').Settings,
  Requester = require('./requester').Requester,
  Resource = require('./requester').Resource,
  EventEmitter2 = require('eventemitter2').EventEmitter2;



var EngineManager = function(io, options){
  var that = this;
  EventEmitter2.call(this, {wildcard: true});
  console.log(this.options);

  

  this.io = io;
  this.engine_processes = {};
  this.global_resources = {};
  this.global_resource_users = {};
  this.options = options;
  console.log(this.options);



  console.log('CONF', this._conf);
  console.log(this.wildcard);


  this.onAny(function(payload){
    console.log('ee', this.event, payload);

    io.emit('data', {event: this.event, payload: payload});
  });

  this.io.of('/engine/client').on('connection', function(socket){
    console.log('client connected');
    that._bindClientSocketHandlers(socket);
  });

};
util.inherits(EngineManager, EventEmitter2);

EngineManager.prototype._bindClientSocketHandlers = function(socket){
  var that = this;
  socket.on('get_processes', function(){

    that.broadcastEnginesInfo();
  });
  socket.on('start', function(payload){
    
    var pid = that.startEngine();
    if(payload && payload.items && payload.items.length){
      that.run(pid, payload.items);
    }
  });
  socket.on('run', function(payload){
    that.run(payload.pid, payload.items);
  });
  socket.on('kill', function(pid){
     console.log('KILL', pid);

    that.killEngine(pid.pid);
  });

};


/* from : child pid */
EngineManager.prototype.allocateGlobalResource = function(from, key, rapp, uri, remappings, parameters, options){ 
  var that = this;

  var resource = that.global_resources[key];

  if(_.isEmpty(resource)){
    var r = new Requester(this);
    var rid = r.id.toString();

    R.forEach(function(remap){
      if(R.isEmpty(remap.remap_to)){
        remap.remap_to = "/" + remap.remap_from + "_" + UUID.v4().replace(/-/g, "")
      }

    })(remappings);

    var res = new Resource();
    res.rapp = rapp;
    res.uri = uri;
    res.remappings = remappings;
    res.parameters = parameters;

    resource = r.send_allocation_request(res, options.timeout).then(function(reqId){
      var ctx = {req_id: rid, remappings: remappings, parameters: parameters, rapp: rapp, uri: uri, allocation_type: options.type, key: key};
      return ctx;
    });
    that.global_resources[key] = resource;

  }

  return resource;
};



EngineManager.prototype.startEngine = function(io, extras){
  var engine_opts = this.options.engine_options;

  logger.info('engine options', engine_opts);

  var child = spawn('node', ['./engine_runner.js', '--option', JSON.stringify(engine_opts)], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']})
  global.childEngine = child;

  logger.info("engine spawn pid :", child.pid);

  child.stdout.on('data', function(data){
    logger.info("engine-" + child.pid, data.toString().trim());
  });
  child.stderr.on('data', function(data){
    logger.info("engine-" + child.pid, data.toString().trim());
  });


  this.engine_processes[child.pid] = {process: child};
  this._bindEvents(child);


  return child.pid;
}

EngineManager.prototype.broadcastMessage = function(msg){
  return _(this.engine_processes)
    .each(function(child, pid){
      var proc = child.process;
      proc.send(msg);
    }).value();



};


EngineManager.prototype.callOnReady = function(pid, cb) {
  var c = this.engine_processes[pid];
  if(c && c.status && c.status == 'ready'){
    cb.call(this);
  }else{
    this.once(['child', pid, 'ready'].join('.'), cb.bind(this));
  }
  
}

EngineManager.prototype.run = function(pid, workflows){
  var that = this;
  console.log("*******", workflows);

  this.callOnReady(pid, function(){

    var items = Settings.getItems(function(e, items){
      var items_to_load = _(items)
        .filter(function(i) { return _.contains(workflows, i.title); })
        .sortBy(function(i) { return _.indexOf(workflows, i.title); })
        .value();
      var child = that.engine_processes[pid];
      var proc = child.process;
      proc.send({action: 'run', items: items_to_load});
      child.running_items = items_to_load;


    });

  });

};


EngineManager.prototype.broadcastEnginesInfo = function(){
  var payload = _.map(this.engine_processes, function(child, pid){
    var data = _.omit(child, 'process');
    return _.assign(data, {pid: pid});
  });
  console.log(payload);

  this.io.of('/engine/client')
    .emit('data', {event: 'processes', payload: payload});

};

EngineManager.prototype._bindEvents = function(child){
  var proc = this.engine_processes[child.pid];

  var that = this;
  child.on('message', function(msg){

    var action = msg.action;
    var result = null;
    if(action == 'status'){
      var status = msg.status;
      logger.info('engine status to '+status);
      proc.status = status;
      that.emit(['child', child.pid, status].join('.'));
      result = that.broadcastEnginesInfo();

    }
    else if(action == 'allocate_resource'){
      result = that.allocateGlobalResource(child.pid, msg.key,
                             msg.rapp, msg.uri, msg.remappings, msg.parameters, msg.options);

    }
    else{
      var action = msg.action;
      result = that.emit(['child', child.pid, action].join('.'), msg);


    }


    if(msg.__request_id){
      Promise.all([result]).then(function(results){
        var res = results[0];
        // child.send('return.'+msg.__request_id);
        // child.send({cmd: 'return', request_id: msg.__request_id, result: res}); // 'return.'+msg.__request_id);
        child.send({cmd: 'return.'+msg.__request_id, request_id: msg.__request_id, result: res}); // 'return.'+msg.__request_id);

      });


    }

  });

};



EngineManager.prototype.killEngine = function(pid){
  logger.info('will kill engine : ' + pid);

  var child = this.engine_processes[pid].process;
  child.kill('SIGTERM');
  delete this.engine_processes[pid];


  this.broadcastEnginesInfo();

};


EngineManager.prototype.stopEngine = function(pid){
  var child = this.engine_processes[pid];

  child.on('message', function(msg){
    if(msg == 'engine_stopped'){
      child.kill('SIGTERM');
    }
  });

  delete this.engine_processes[pid];

};

EngineManager.prototype.restartEngine = function(pid){
  childEngine.on('message', function(msg){
    if(msg == 'engine_stopped'){
      childEngine.kill('SIGTERM');
      startEngine();
    }
  });
  childEngine.send({action: 'stop'});
};

// global.childEngine.on('message', function(msg){

  // if(msg == 'engine_start_failed'){
    // logger.error('engine start failed');
  // }else if(msg == 'engine_started'){
    // logger.info('engine started');
  // }else if(msg == 'engine_ready'){
    // logger.info('engine ready')
    // var workflows = argv.workflow;
    // if(!_.isEmpty(workflows)){
      // var col = db.collection('settings');
      // col.findOne({key: 'cento_authoring_items'}, function(e, data){
        // var items = data ? data.value.data : [];
        // var items_to_load = _(items)
          // .filter(function(i) { return _.contains(workflows, i.title); })
          // .sortBy(function(i) { return _.indexOf(workflows, i.title); })
          // .value();
    
        // global.childEngine.send({action: 'run', items: items_to_load});
      // });

    // }

  // }

// });



module.exports = EngineManager;
