#!/usr/bin/env node

var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  express = require('express'),
  MongoClient = require('mongodb').MongoClient,
  Engine = require('./engine');
  

MongoClient.connect(process.env.MONGO_URL, function(e, db){
  if(e) throw e;
  console.log('mongo connected');

  /*
   * Express
   */

  var app = express();
  app.use(express.static('public'));
  app.use(bodyParser.json());

  // This is where all the magic happens!
  app.engine('html', swig.renderFile);

  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');

  app.set('view cache', false);
  swig.setDefaults({ cache: false });


  require('./routes')(app, db);

  server = app.listen(process.env.PORT, function(){
    console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
  });


  $engine = new Engine(db);

  var args = process.argv.slice(1);
  if(args.length){
    $engine.once('started', function(){
      $engine.runBlocks(args);
    });

  }




});



