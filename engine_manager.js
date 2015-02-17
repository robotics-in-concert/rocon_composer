var spawn = require('child_process').spawn,
  _ = require('lodash'),
  util = require('util'),
  Settings = require('./model').Settings,
  EventEmitter2 = require('eventemitter2').EventEmitter2;



var EngineManager = function(io, options){
  var that = this;
  EventEmitter2.call(this, {wildcard: true});
  console.log(this.options);

  

  this.io = io;
  this.engine_processes = {};
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
    if(payload && payload.items){
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
  this.callOnReady(pid, function(){

    var items = Settings.getItems(function(e, items){
      var items_to_load = _(items)
        .filter(function(i) { return _.contains(workflows, i.title); })
        .sortBy(function(i) { return _.indexOf(workflows, i.title); })
        .value();
      var c = that.engine_processes[pid].process;
      c.send({action: 'run', items: items});


    });

  });

};


EngineManager.prototype.broadcastEnginesInfo = function(){
  var payload = _.map(this.engine_processes, function(child, pid){
    var data = _.omit(child, 'process');
    return _.assign(data, {pid: pid});
  });
  this.io.of('/engine/client')
    .emit('data', {event: 'processes', payload: payload});

};

EngineManager.prototype._bindEvents = function(child){
  var proc = this.engine_processes[child.pid];

  var that = this;
  child.on('message', function(msg){

    var action = msg.action;
    if(action == 'status'){
      var status = msg.status;
      logger.info('engine status to '+status);
      proc.status = status;
      that.emit(['child', child.pid, status].join('.'));
      that.broadcastEnginesInfo();

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
