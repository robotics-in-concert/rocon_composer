#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  winston = require('winston'),
  Engine = require('./engine');

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


setupLogger();

var engine_options = JSON.parse(argv.option);

process.on('message', function(data){
  console.log(data);


  var action = data.action;
  console.log(action);

  if(action == 'run'){
    var items = data.items;
    $engine.runItems(items);
  }
  if(action == 'stop'){
    $engine.clear().then(function(){
      process.send('engine_stopped');
    });
  }

});

$engine = new Engine(engine_options);

$engine.once('started', function(){
  process.send('engine_started');

});
$engine.once('ready', function(){
  process.send('engine_ready');

});
$engine.once('start_failed', function(){
  process.send('engine_start_failed');

});






