_ = require('lodash');
Utils = require('./utils');





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
      types_to_load = _.compact(_.flatten(types_to_load));

      
      
      res.send({interfaces: data, types: _.flatten(types_to_load)});
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
    $engine.load()
    res.send({result: true});
  });
  app.post('/api/eval', function(req, res){
    var code = req.body.code;
    $engine.runCode(code);
    res.send({result: true});


  });

};
