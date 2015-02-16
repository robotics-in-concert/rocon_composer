var spawn = require('child_process').spawn,
  util = require('util'),
  EventEmitter2 = require('eventemitter2').EventEmitter2;

var EngineManager = function(io, options){
  EventEmitter2.call(this, {wildcard: true});
  this.io = io;
  this.engine_processes = {};
  this.options = options;
};
util.inherits(EngineManager, EventEmitter2);


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


  this._bindEvents(child);
  this.engine_processes[child.pid] = child;

  return child.pid;
}



EngineManager.prototype._bindEvents = function(child){
  child.on('message', function(msg){
    if(msg == 'engine_start_failed'){
      logger.error('engine start failed');
    }else if(msg == 'engine_started'){
      logger.info('engine started');
    }else if(msg == 'engine_ready'){
      logger.info('engine ready')
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

    }

  });

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
