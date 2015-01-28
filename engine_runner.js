#!/usr/bin/env node

var _ = require('lodash'),
  Engine = require('./engine');



console.log(process.env);

process.on('message', function(data){
  console.log("<<", data.foo);
});

$engine = new Engine(/* db */null, /* io */ null, /* argv.engine_options */ {});

$engine.once('started', function(){
  // started
  console.log('engine started');

});



