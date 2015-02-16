#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  winston = require('winston'),
  Engine = require('./engine');



$pid = process.pid;
setupLogger();

console.log('my pid', $pid);



var _postStatus = function(status){ process.send({action: 'status', status: status}); };

var engine_options = JSON.parse(argv.option);

$engine = new Engine(engine_options);

$engine.once('started', function(){
  _postStatus('started');

});
$engine.once('ready', function(){
  _postStatus('ready');
});
$engine.once('start_failed', function(){
  _postStatus('start_failed');
});




process.on('message', function(data){
  console.log(data);


  var action = data.action;
  console.log(action);

  if(action == 'run'){
    var items = data.items;
    $engine.runItems(items);
  }
  if(action == 'clear'){
    $engine.clear().then(function(){
      _postStatus('stopped');
    });
  }

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


