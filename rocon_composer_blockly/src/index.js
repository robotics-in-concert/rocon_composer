var _ = require('lodash'),
  argv = require('minimist')(process.argv.slice(2)),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  http = require('http'),
  express = require('express'),
  MongoClient = require('mongodb').MongoClient,
  winston = require('winston'),
  fs = require('fs'),
  mongoose = require('mongoose');



var config = {}
if(fs.existsSync(__dirname + "/../config.json")){
  var config = _.defaults(require('../config.json'), {
    port: 9999,
    mongo_url: "mongodb://localhost:27017/rocon_composer",
    rocon_protocols_webserver_address : "http://localhost:10000",
    log_level: "info"
  });
}
global.config = config;



module.exports = function(){
  setupLogger();
  start();
};

function start(){
  logger.info('config', config);


  mongoose.connect(config.mongo_url);


  MongoClient.connect(config.mongo_url, function(e, db){
    if(e) throw e;

    var app = express(); 
    var server = http.createServer(app);

    app.use(express.static('public'));
    app.use(bodyParser.json({limit: '50mb'}));
    app.engine('html', swig.renderFile);

    app.set('view engine', 'html');
    app.set('views', __dirname + '/../views');

    app.set('view cache', false);
    swig.setDefaults({ cache: false });


    require('./routes')(app, db);

    server = server.listen(config.port, function(){
      logger.info('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
    });


  });

}


function setupLogger(){
  winston.loggers.add('main', {
    console: {
      colorize: true,
      level: config.log_level,
      prettyPrint: true
    }

  });
  var logger = winston.loggers.get('main')
  // logger.cli()

  global.logger = logger;

  logger.debug('logger initialized');

};

