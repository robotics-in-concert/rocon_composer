_ = require('lodash');





module.exports = function(app, redis){

  app.get('/', function(req, res){
    res.render('index');
  });
  app.get('/ping', function(req, res){
    res.send('pong')
  });


  app.post('/api/publish', function(req, res){
    var topic = req.body.topic;
    $engine.pub(topic);
    res.send({result: true})
  });
  app.post('/api/param/:key', function(req, res){
    var k = req.params.key;
    $engine.setParam(k, req.body, function(){
      res.send({result: true})
    });

  });
  app.get('/api/param/:key', function(req, res){
    var k = req.params.key;


    $engine.getParam(k, function(value){
      res.send(value);
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
