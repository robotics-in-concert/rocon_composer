
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


