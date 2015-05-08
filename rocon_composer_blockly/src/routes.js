var _ = require('lodash')
  , Promise = require('bluebird')
  , Utils = require('./utils')
  , util = require('util')
  , async = require('async')
  , request = require('request')
  , requestP = Promise.promisify(request)
  , path = require('path')
  , URL = require('url')
  , JSONSelect = require('JSONSelect')
  , Settings = require('./model').Settings
  , HicApp = require('./hic_app')
  , Rapp = require('./rapp')
  , ServiceStore = require('./service_store');

var _getMessageDetails = function(type, cb){
  var url = URL.resolve(config.rocon_protocols_webserver_address, "/api/message_details");
  request(url, {qs: {type: type}, json: true}, function(e, res, body){
    cb(null, body);
  });
};



var load_types = function(types_to_load, load_types_callback){
  async.map(types_to_load, _getMessageDetails, function(e, types){
    var z = _.zipObject(types_to_load, types)
    var types = _.mapValues(z, function(mv, k){
      return _.mapValues(_.groupBy(mv, 'type'), function(x){ return x[0]; });
    });
    load_types_callback(types);
  });

};



module.exports = function(app, db){

  app.get('/', function(req, res){
    res.render('index', {
      msg_database: config.rocon_protocols_webserver_address
    });
  });
  app.get('/prezi', function(req, res){
    res.render('prezi', {socketio_port: $socketio_port});
  });
  app.get('/engine', function(req, res){
    res.render('engine');
  });
  app.get('/ping', function(req, res){
    res.send('pong')
  });

  app.get('/api/load_interactions', function(req, res){
    if(!config.rocon_protocols_webserver_address){
      res.send('no rocon protocols web', 500);
      return
    }


    var apiPath = URL.resolve(config.rocon_protocols_webserver_address, "api/hic_app");

    requestP(apiPath, {json: true}).spread(function(res0, data){
      var types_to_load = _.unique(JSONSelect.match('.interface .type', data))
      load_types(types_to_load, function(types){
        res.send({data: data, types: types});
      });

    });
  });



  app.post('/api/load_rapp', function(req, res){
    var proto_web = config.rocon_protocols_webserver_address;
    if(!proto_web){
      res.send('no rocon protocols web', 500);
      return;
    }


    var apiPath = URL.resolve(proto_web, "api/rocon_app");

    request.get(apiPath, function(e, res0, body){
      if(e){
        res.status(500).send('cannot load msg_database');
        return;
      }
      var data = JSON.parse(body)
      var ifs =  JSONSelect.match('.public_interface', data);
      var types_to_load =  _.unique(JSONSelect.match('.public_interface .type', data));

      load_types(types_to_load, function(types){
        res.send({rapps: data, types: types});
      });
    });

  });


  app.post('/api/publish', function(req, res){
    var topic = req.body.topic;

    global.engineProcess.send({action: 'publish', data: topic});
    res.send({result: true})
  });

  app.post('/api/param/:key', function(req, res){
    var col = db.collection('settings');
    var k = req.params.key;
    col.update({key: k}, {$set: {value: req.body}}, {w: 1, upsert: true}, function(err, doc){
      res.send({result: true})
    });

  });
  app.get('/api/param/:key', function(req, res){
    var k = req.params.key;
    var col = db.collection('settings');
    col.findOne({key: k}, function(err, doc){
      if(!doc){
        res.send([]);
      }else{
        res.send(doc.value);
      }

    });
  });



  app.get('/api/packages', function(req, res){
    var ss = new ServiceStore();
    ss.allPackageInfos().then(function(rows){
      res.send(rows);

    });

  });

  app.post('/api/services/save', function(req, res){
    var ss = new ServiceStore();
    ss.exportToROS(req.body.title, req.body.description, req.body.service, req.body.package).then(function(){
      res.send('ok');
    }).done(function(){
      console.log(arguments);

      
    });



  });

  app.post('/api/hic_app/save', function(req, res){
    var app = new HicApp({});
    app.save(req.body).then(function(){
      res.send('ok');
    });

  });
  app.post('/api/rapp/save', function(req, res){
    var rapp = new Rapp({});
    rapp.save(req.body).then(function(){
      res.send('ok');
    });

  });

};
