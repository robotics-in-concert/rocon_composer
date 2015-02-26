#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  winston = require('winston'),
  EventEmitter2 = require('eventemitter2').EventEmitter2,
  process_send2 = require('./utils').process_send2,
  Engine = require('./engine');


process.name = 'rocon-workflow-engine'

$pid = process.pid;
setupLogger();

console.log('my pid', $pid);




var _postStatus = function(status){ process.send({action: 'status', status: status}); };

var engine_options = JSON.parse(argv.option);

$engine = new Engine(engine_options);

$engine.on('status.*', function(){
  var en = this.event.split(/\./)[1];
  _postStatus(en);

});
$engine.on('ros.**', function(payload){
  var tail = _.tail(this.event.split(/\./));
  var action = tail[0];
  var topic = tail[1];
  process_send2({action: action, topic: topic, payload: payload})
    .then(function(x){
      console.log('XXXX', x);

    });
});


global.process_events = new EventEmitter2({wildcard: true});

process.on('message', function(data){
  var name = data.action || data.cmd;
  process_events.emit(name, data);
});



process_events.on('run', function(data){
  var items = data.items;
  $engine.runItems(items);
  _postStatus('running');
});

process.on('message', function(data){
  console.log(data);


  var action = data.action;
  console.log(action);

  if(action == 'clear'){
    $engine.clear().then(function(){
      _postStatus('stopped');
    });
  }
  if(action == 'resource_allocated'){
    var ctx = payload.ctx;
    $engine.emit('manager.resource_allocated.'+ctx.key);
  };

});


function setupLogger(){
  winston.loggers.add('main', {
    console: {
      colorize: true,
      level: process.env.ROCON_AUTHORING_LOG_LEVEL,
      prettyPrint: true
    }

  });
  var logger = winston.loggers.get('main')
  // logger.cli()

  global.logger = logger;

  logger.debug('logger initialized');

};


