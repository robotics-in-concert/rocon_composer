#!/usr/bin/env node

var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  http = require('http'),
  express = require('express'),
  socketio = require('socket.io'),
  MongoClient = require('mongodb').MongoClient,
  winston = require('winston'),
  EngineManager = require('./engine_manager'),
  Engine = require('./engine');

setupLogger();
checkEnvVars();






MongoClient.connect(process.env.ROCON_AUTHORING_MONGO_URL, function(e, db){
  if(e) throw e;



  /*
   * Express
   */
  if(argv.web){

    var app = express(); 
    var server = http.createServer(app);
    var server2 = http.createServer(app);
    var io = socketio.listen(server);
    $io = io;

    io.of('/engine').on('connection', function(sock){
      logger.info('engine socket connected', sock.id);
      sock.on('intro', function(payload){
        logger.debug(payload);
        sock.my = payload;
      });
    });


    app.use(express.static('public'));
    app.use(bodyParser.json({limit: '50mb'}));

    // This is where all the magic happens!
    app.engine('html', swig.renderFile);

    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');

    app.set('view cache', false);
    swig.setDefaults({ cache: false });


    require('./routes')(app, db);

    server = server.listen(process.env.ROCON_AUTHORING_SERVER_PORT, function(){
      logger.info('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
    });








  }

  var engine_opts = _.defaults(argv.engine_options || {}, {
    publish_delay: +process.env.ROCON_AUTHORING_PUBLISH_DELAY,
    service_port: +process.env.ROCON_AUTHORING_SERVER_PORT
  });
  global.engineManager = new EngineManager(io.of('/engine'), {engine_options: engine_opts});


  if(argv.workflow){
    argv.engine = true;
  }


  if(argv.engine){
    var pid = engineManager.startEngine();
    var pid2 = engineManager.startEngine();
    



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

function checkEnvVars(){

  ['ROCON_AUTHORING_SERVER_PORT',
    'ROCON_AUTHORING_ROSBRIDGE_URL',
    'ROCON_AUTHORING_MONGO_URL',
    'ROCON_AUTHORING_PUBLISH_DELAY',
    'MSG_DATABASE'].forEach(function(e){
      var v = process.env[e]
      if(v){
        logger.info(e, process.env[e].green);
      }else{
        logger.info(e, 'null'.red);
      }
    });

};

