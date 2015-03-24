var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  http = require('http'),
  express = require('express'),
  socketio = require('socket.io'),
  socketio_wildcard = require('socketio-wildcard'),
  MongoClient = require('mongodb').MongoClient,
  winston = require('winston'),
  mongoose = require('mongoose');



module.exports = function(){
  setupLogger();
  checkEnvVars();
  start();
};


function start(){

  mongoose.connect(process.env.ROCON_SERVICE_COMPOSER_BLOCKLY_MONGO_URL);


  MongoClient.connect(process.env.ROCON_SERVICE_COMPOSER_BLOCKLY_MONGO_URL, function(e, db){
    if(e) throw e;

    var app = express(); 
    var server = http.createServer(app);
    var io = socketio(server);
    io.use(socketio_wildcard());
    io.of('/engine/client').use(socketio_wildcard());

    $io = io;

    io.on('connection', function(sock){
    });


    app.use(express.static('public'));
    app.use(bodyParser.json({limit: '50mb'}));
    app.engine('html', swig.renderFile);

    app.set('view engine', 'html');
    app.set('views', __dirname + '/../views');

    app.set('view cache', false);
    swig.setDefaults({ cache: false });


    require('./routes')(app, db);

    server = server.listen(process.env.ROCON_SERVICE_COMPOSER_BLOCKLY_SERVER_PORT, function(){
      logger.info('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
    });


  });

}


function setupLogger(){
  winston.loggers.add('main', {
    console: {
      colorize: true,
      level: process.env.ROCON_SERVICE_COMPOSER_BLOCKLY_LOG_LEVEL,
      prettyPrint: true
    }

  });
  var logger = winston.loggers.get('main')
  // logger.cli()

  global.logger = logger;

  logger.debug('logger initialized');

};

function checkEnvVars(){

  ['ROCON_SERVICE_COMPOSER_BLOCKLY_SERVER_PORT',
    'ROCON_SERVICE_COMPOSER_BLOCKLY_ROSBRIDGE_URL',
    'ROCON_SERVICE_COMPOSER_BLOCKLY_MONGO_URL',
    'ROCON_SERVICE_COMPOSER_BLOCKLY_PUBLISH_DELAY',
    'MSG_DATABASE'].forEach(function(e){
      var v = process.env[e]
      if(v){
        logger.info(e, process.env[e].green);
      }else{
        logger.info(e, 'null'.red);
      }
    });

};

