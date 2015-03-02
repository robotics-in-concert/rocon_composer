
var _ = require('lodash'),
  Promise = require('bluebird'),
  EventEmitter2 = require('eventemitter2').EventEmitter2,
  ROSLIB = require('roslib'),
  Utils = require('./utils'),
  process_send2 = Utils.process_send2,
  util = require('util');

var Ros = function(opts){
  EventEmitter2.call(this, {wildcard: true});
  var that = this;
  this.options = _.assign({
    ros_retries: 0,
    ros_retry_interval: 1000,
  }, opts);

  var retry_op = Utils.retry(function(){
    logger.info('trying to connect to ros ' + process.env.ROCON_AUTHORING_ROSBRIDGE_URL);
    var connected = false;

    var ros = that.underlying = new ROSLIB.Ros({encoding: 'utf8'});

    ros.on('error', function(e){
      logger.info('ros error', e);
      if(!connected){
        retry_op.retry();
      }
    });
    ros.on('connection', function(){
      logger.info('ros connected');
      that.emit('started');

      that.waitForTopicsReady(['/concert/scheduler/requests']).then(function(){
        that.emit('ready');
      });
      connected = true;
    });
    ros.on('close', function(){
      logger.info('ros closed');
      // retry_op.retry();
    });
    ros.connect(process.env.ROCON_AUTHORING_ROSBRIDGE_URL);

  }, function(e){
    logger.error('ros connection failed', e);
    that.emit('start_failed');
    
  }, this.options.ros_retries, this.options.ros_retry_interval);


  this.subscribe_topics = [];
  this.publish_queue = [];
  this.publish_loop_timer = null;



};

util.inherits(Ros, EventEmitter2);


// public - promise version
Ros.prototype.waitForTopicsReady = function(required_topics){
  var that = this;
  var delay = process.env.rocon_authoring_delay_after_topics || 2000;

  return new Promise(function(resolve, reject){
    var timer = setInterval(function(){
      that.underlying.getTopics(function(topics){
        var open_topics = _(topics).filter(function(t){ return _.contains(required_topics, t); }).value();
        console.log('topic count check : ', [open_topics.length, required_topics.length].join("/"), open_topics, required_topics);

        if(open_topics.length >= required_topics.length){
          clearInterval(timer);
          setTimeout(function(){ resolve(); }, delay);
        }
      });

    }, 1000);

  });


};


Ros.prototype.subscribe = function(topic, type, cb){

  var that = this;
  var listener = new ROSLIB.Topic({
    ros : this.underlying,
    name : topic,
    messageType : type
  });

  listener.subscribe(function(message) {
    logger.debug('Received message on ' + listener.name + ': ' + message);
    that.emit('subscribe.'+topic, message);
    if(_.isFunction(cb)){ cb.call(null, message); }
  });

  this.subscribe_topics.push({topic: topic, listener: listener});
};


Ros.prototype.startPublishLoop = function(){

  var that = this;
  that.publish_loop_timer = setInterval(function(){
    var data = that.publish_queue.shift();
    if(!data){
      return;
    }

    var topic = new ROSLIB.Topic({
      ros : that.underlying,
      name : data.topic,
      messageType : data.type
    });

    var msg = new ROSLIB.Message(data.msg);


    // And finally, publish.
    topic.publish(msg);
    logger.debug("published "+topic.name);
    that.emit('publish', {name: data.name, type: data.type, payload: data.msg});

  }, this.options.publish_delay);
  engine.log('publish loop started');
};
Engine.prototype.stopPublishLoop = function(){
  clearInterval(this.publish_loop_timer);
};


Ros.prototype.publish = function(topic, type, msg){
  this.publish_queue.push({topic: topic,  type: type, msg: msg});

};
