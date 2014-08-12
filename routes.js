_ = require('lodash');

module.exports = function(app, redis){

  app.get('/', function(req, res){
    res.render('index');
  });
  app.get('/ping', function(req, res){
    res.send('pong')
  });


  app.get('/api/reload', function(req, res){
    redis.publish('cento', 'reload', function(e, r){
      res.send({result: true});

    });

  });

  app.get('/api/blocks', function(req, res){
    redis.sort("block_ids", "by", "nosort", "get", "blocks:*->title", "get", "blocks:*->xml", "get", "#", function(e, r){
      var x = _(r).groupBy( function(e, idx){ return Math.floor(idx/3); } )
        .values()
        .map(function(entry){ return _.zipObject(['title', 'xml', 'id'], entry); })
        .value();
      res.send(x);
    });


  });
  app.get('/api/blocks/:id', function(req, res){
    var id = req.params.id;
    redis.lrange('blocks', 0, -1, function(e, rows){
      res.send( _.where(rows, {id: id}) );
    });


  });
  app.delete('/api/blocks/:id', function(req, res){

    var id = req.params.id;
    redis.multi()
      .del('blocks:'+id)
      .lrem('block_ids', 0, id)
      .exec(function(e, r){
        console.log(e);

        res.send({result: true});

      });


  });
  app.put('/api/blocks/:id', function(req, res){
    var id = req.params.id;
    data = req.body


    redis.multi()
      .hmset('blocks:'+id, data)
      .exec(function(e, r){
        res.send(r);
      });

  });
  app.post('/api/blocks', function(req, res){
    var newId = new Date().getTime();
    var key = "blocks:"+newId
    data = req.body


    redis.multi()
      .hmset(key, data)
      .lpush('block_ids', newId)
      .exec(function(e, r){
        res.send({id: newId});
      });

  });


};
