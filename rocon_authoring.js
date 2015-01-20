#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  express = require('express'),
  MongoClient = require('mongodb').MongoClient,
  Engine = require('./engine');
  


MongoClient.connect(process.env.ROCON_AUTHORING_MONGO_URL, function(e, db){
  if(e) throw e;



  /*
   * Express
   */
  if(argv.web){
    var app = express();
    app.use(express.static('public'));
    app.use(bodyParser.json({limit: '50mb'}));

    // This is where all the magic happens!
    app.engine('html', swig.renderFile);

    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');

    app.set('view cache', false);
    swig.setDefaults({ cache: false });


    require('./routes')(app, db);

    server = app.listen(process.env.ROCON_AUTHORING_SERVER_PORT, function(){
      console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
    });





  }


  if(argv.workflow){
    argv.engine = true;
  }


  if(argv.engine){
    $engine = new Engine(db);

    var args = argv.workflow
    if(args && args.length){
      $engine.once('started', function(){
        $engine.runBlocks(args);
      });

    }

  }






});



