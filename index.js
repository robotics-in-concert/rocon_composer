var _ = require('lodash'),
  Redis = require('redis'),
  redis_pubsub = Redis.createClient(6379, "cento.robotconcert.org"),
  redis = Redis.createClient(6379, "cento.robotconcert.org"),
  EventEmitter = require('events').EventEmitter,
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  express = require('express');

/*
 * Express
 */

var app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// This is where all the magic happens!
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.set('view cache', false);
swig.setDefaults({ cache: false });


require('./routes')(app, redis);

server = app.listen(process.env.PORT, function(){
  console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
});

/*
 * Engine class
 */

var Engine = function(redis){
  this.redis = redis;
  this.ee = new EventEmitter();
  this.memory = {};
};

Engine.prototype.publish = function(event_name, params){
  var data = {event: event_name};
  _.assign(data, params);
  this.redis.publish(CHANNEL_NAME, JSON.stringify(data));

};
Engine.prototype.clear = function(){
  this.ee.removeAllListeners();
  this.memory = {};
};
Engine.prototype.print = function(msg){
  console.log(msg.green);

};

Engine.prototype.reload = function(){
  var that = this;
  this.clear();
  this.redis.sort("block_ids", "by", "nosort", "get", "blocks:*->js", "get", "blocks:*->title", "get", "blocks:*->xml", "get", "#", function(e, r){
    var keys = ['js', 'title', 'xml', 'id'];
    var blocks = _(r).groupBy( function(e, idx){ return Math.floor(idx/keys.length); } )
      .values()
      .map(function(entry){ return _.zipObject(keys, entry); })
      .value();


    console.log(blocks.length + " blocks loaded.");

    var scripts = _.map(blocks, function(row){
      return row.js;
    }).join("\n\n\n");


    eval(scripts);

    console.log("---------------- scripts -----------------");
    console.log(scripts);
    console.log("------------------------------------------");


    console.log("scripts evaluated.");

  });

};


$engine = new Engine(redis);





CHANNEL_NAME = 'cento'

redis_pubsub.on('subscribe', function(channel, cnt){
  console.log('subscribe', channel, cnt)
  $engine.reload();
});
redis_pubsub.on('message', function(channel, msg){
  if(msg == 'reload'){
    $engine.reload();

  }else{
    var data = JSON.parse(msg);

    $engine.ee.emit(data.event, _.omit(data, 'event'));
    console.log('message', channel, data)
    redis.lpush(channel, msg)
  }
});

redis_pubsub.subscribe(CHANNEL_NAME);




$engine.ee.on('foo', function(data){
  console.log('got ee', arguments);
  eval("console.log('#{data}');")
});
  
