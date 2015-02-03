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
  , ServiceStore = require('./service_store');

var load_types = function(types_to_load, load_types_callback){
  async.map(types_to_load, _.bind($engine.getMessageDetails, $engine), function(e, types){
    var z = _.zipObject(types_to_load, types)
    var types = _.mapValues(z, function(mv, k){
      return _.mapValues(_.groupBy(mv, 'type'), function(x){ return x[0]; });
    });
    load_types_callback(types);
  });

};



module.exports = function(app, db){

  app.get('/', function(req, res){
    res.render('index', {msg_database: process.env.MSG_DATABASE});
  });
  app.get('/prezi', function(req, res){
    res.render('prezi', {query: req.query});
  });
  app.get('/ping', function(req, res){
    res.send('pong')
  });


  app.get('/api/load_interactions', function(req, res){
    if(!process.env.MSG_DATABASE){
      res.send('no rocon protocols web', 500);
      return
    }


    var apiPath = URL.resolve(process.env.MSG_DATABASE, "api/hic_app");

    requestP(apiPath, {json: true}).spread(function(res0, data){
      var types_to_load = _.unique(JSONSelect.match('.interface .type', data))
      load_types(types_to_load, function(types){
        res.send({data: data, types: types});
      });

    });
  });

  app.post('/api/load_rapp', function(req, res){
    if(!process.env.MSG_DATABASE){
      res.send('no rocon protocols web', 500);
      return;
    }


    var apiPath = URL.resolve(process.env.MSG_DATABASE, "api/rocon_app");

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
    $engine.pub(topic);
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


  app.post('/api/engine/reset', function(req, res){
    $engine.clear()
    res.send({result: true});


  });
  app.post('/api/engine/load', function(req, res){

    var items = req.body.blocks;
    $engine.runBlocksById(items)
    res.send({result: true});
  });
  app.post('/api/eval', function(req, res){
    var code = req.body.code;
    $engine.runCode(code);
    res.send({result: true});


  });


  app.get('/api/packages', function(req, res){
    var ss = new ServiceStore({ros_root: process.env.ROS_PACKAGE_ROOT});
    ss.allPackageInfos().then(function(rows){
      res.send(rows);

    });

  });

  app.post('/api/services/save', function(req, res){
    var ss = new ServiceStore({ros_root: process.env.ROS_PACKAGE_ROOT});
    ss.exportToROS('package_name', req.body.service, req.body.package).then(function(){
      res.send('ok');
    });



  });

};
