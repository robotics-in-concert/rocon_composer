_ = require('lodash');
Utils = require('./utils');
async = require('async');





module.exports = function(app, db){

  app.get('/', function(req, res){
    res.render('index');
  });
  app.get('/ping', function(req, res){
    res.send('pong')
  });


  app.post('/api/load_rapp', function(req, res){
    var url = req.body.url;
    Utils.extract_rapp_meta(url, function(e, data){
      types_to_load = _.map(data, function(interface){
        return _.map(interface, function(v, k){
          if(k == 'subscribers'){
            return _.pluck(v, 'type');
          }

        });

      });
      console.log(types_to_load);

      types_to_load = _.compact(_.flatten(types_to_load));
      async.map(types_to_load, _.bind($engine.getMessageDetails, $engine), function(e, types){
        var z = _.zipObject(types_to_load, types)
        var types = _.mapValues(z, function(mv, k){
          return _.mapValues(_.groupBy(mv, 'type'), function(x){ return x[0]; });
        });
        res.send({interfaces: data, types: types});
      });


      
      
      // res.send({interfaces: data, types: _.flatten(types_to_load)});
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

    $engine.runBlocks(items)
    res.send({result: true});
  });
  app.post('/api/eval', function(req, res){
    var code = req.body.code;
    $engine.runCode(code);
    res.send({result: true});


  });

};
