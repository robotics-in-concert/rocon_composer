#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  Engine = require('./engine');



var engine_options = JSON.parse(argv.option);


process.on('message', function(data){
  console.log(data);


  var action = data.action;
  console.log(action);


  if(action == 'run'){
    console.log('1111111111');

    var items = data.items;
    $engine.runItems(items);
  }
    

});

$engine = new Engine(/* db */null, /* io */ null, engine_options);

$engine.once('started', function(){
  // started
  console.log('engine started');

});



