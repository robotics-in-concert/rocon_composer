var _ = require('lodash'),
  R = require('ramda'),
  Promise = require('bluebird'),
  EventEmitter = require('events').EventEmitter,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  express = require('express'),
  ROSLIB = require('roslib'),
  Fiber = require('fibers')
  Future = require('fibers/future'),
  wait = Future.wait,
  Utils = require('./utils'),
  util = require('util'),
  request = require('request'),
  Requester = require('./requester').Requester,
  Resource = require('./requester').Resource,
  UUID = require('node-uuid'),
  URL = require('url');


DEBUG = process.env.DEBUG || false



/*
 * Engine class
 */

var Engine = function(opts){
  this.options = _.assign({
    ros_retries: 0,
    ros_retry_interval: 1000,
  }, opts);

  this.io = require('socket.io').listen(this.options.socketio_port);
  this.log('socketio listen on '+this.options.socketio_port);


  this.io.on('connection', function(socket){
    console.log('socket conntected ', socket.id);
  });

  this.ee = new EventEmitter();
  this.executions = [];
  this.memory = {};
  var ros = this.ros = new ROSLIB.Ros({encoding: 'utf8'});
  var engine = this;
  this.topics = [];
  var that = this;
  this.schedule_requests = {};
  this.schedule_requests_ref_counts = {};

  this.publish_queue = [];

  var retry_op = Utils.retry(function(){
    engine.log('trying to connect to ros ' + process.env.ROCON_AUTHORING_ROSBRIDGE_URL);
    var connected = false;

    var ros = that.ros = new ROSLIB.Ros({encoding: 'utf8'});

    ros.on('error', function(e){
      engine.log('ros error', e);
      if(!connected){
        retry_op.retry();
      }
    });
    ros.on('connection', function(){
      engine.log('ros connected');
      engine.emit('started');
      connected = true;
      // ros.getMessageDetails('simple_delivery_msgs/DeliveryStatus', function(detail){
        // console.log('detail', detail);
      // });
      // ros.getMessageDetails('simple_delivery_msgs/DeliveryOrder', function(detail){
        // console.log('detail', detail);
      // });
      // ros.getTopics(function(topics){
        // console.log('topics : ', topics);
      // });
      // ros.getServices(function(topics){
        // // console.log('services : ', topics);
      // });

    });
    ros.on('close', function(){
      engine.log('ros closed');
      // retry_op.retry();
    });
    ros.connect(process.env.ROCON_AUTHORING_ROSBRIDGE_URL);

  }, function(e){
    logger.error('ros connection failed', e);

    
  }, this.options.ros_retries, this.options.ros_retry_interval);

  engine.startPublishLoop();

  _.defer(function(){
    // engine.emit('started');

  });
  this.initSocket();

};
util.inherits(Engine, EventEmitter);

Engine.prototype.socketBroadcast = function(key, msg){
  this.io.emit(key, msg);
  this.debug('socket#emit', key, msg);
};

Engine.prototype.initSocket = function(){
  var engine = this;
  this.io.of('/engine').on('connection', function(socket){
    engine.log('websocket connected');
  });


  engine.ee.on('engine:publish', function(data){
    engine.io.of('/engine').emit('publish', data);


  });




};

Engine.prototype.socketBroadcast = function(key, msg){
  this.io.emit(key, msg);
  this.log('socket#emit', key, msg);
};


Engine.prototype.getMessageDetails = function(type, cb){
  var engine = this;
  var url = URL.resolve(process.env.MSG_DATABASE, "/api/message_details");
  request(url, {qs: {type: type}, json: true}, function(e, res, body){
    cb(null, body);
  });
};

Engine.prototype.unsubscribe = function(topic){
  var t = _.remove(this.topics, {name: topic});
  t = t[0];
  t.listener.unsubscribe();
};
Engine.prototype.unsubscribeAll = function(){
  var engine = this;
  this.topics.forEach(function(t){
    t.listener.unsubscribe();
    engine.log("topic "+t.name+" unsubscribed");

  });
  this.topics = [];
};

Engine.prototype.subscribe = function(topic, type){
  var engine = this;
  var listener = new ROSLIB.Topic({
    ros : this.ros,
    name : topic,
    messageType : type
  });

  listener.subscribe(function(message) {
    engine.debug('Received message on ' + listener.name + ': ' + message);
    engine.ee.emit(listener.name, message);

  });

  this.topics.push({name: topic, listener: listener});

};


Engine.prototype.startPublishLoop = function(){

  var engine = this;
  this.publish_loop_timer = setInterval(function(){

    var data = engine.publish_queue.shift();
    if(!data){
      return;
    }

    var topic = new ROSLIB.Topic({
      ros : engine.ros,
      name : data.name,
      messageType : data.type
    });

    var msg = new ROSLIB.Message(data.msg);


    // And finally, publish.
    topic.publish(msg);
    engine.debug("published "+topic.name);
    engine.ee.emit('engine:publish', {name: data.name, type: data.type, payload: data.msg});

  }, this.options.publish_delay);
  engine.log('publish loop started');
};
Engine.prototype.stopPublishLoop = function(){
  clearInterval(this.publish_loop_timer);
};


Engine.prototype.pub = function(topic, type, msg){
  this.publish_queue.push({name: topic,  type: type, msg: msg});
  return null;
};



Engine.prototype.sleep = function(ms){
  var _sleep = function(ms){
    var future = new Future;
    setTimeout(function(){
      future.return();
    }, ms);
    return future;
  };

  _sleep(ms).wait();

};
Engine.prototype.runService = function(name, type, request){
  var e = this;

  var _runService = function(name, type, request){
    var future = new Future;

    var service = new ROSLIB.Service({
     ros : e.ros,
     name : name,
     servicetype : type
    });


    var request = new ROSLIB.ServiceRequest(request);

    service.callService(request, function(result){
      future.return(result);
    });
    return future;

  };
  return _runService(name, type, request).wait();
};

Engine.prototype.runCode = function(code){
  code = ["var f = Fiber(function(){ try{ ", code , " }catch(error_in_fiber){ console.log('error in fiber', error_in_fiber); }}); f.run(); f"].join("\n");
  code = Utils.js_beautify(code);
  this.debug("---------------- scripts -----------------");
  this.debug(_.map(code.split(/\n/), function(line){ return line; }).join("\n"));
  this.debug("------------------------------------------");
  try{
    var f = eval(code);
    this.executions.push(f);
    this.log("scripts evaluated.");
  }catch(e){
    this.log('invalid block scripts. failed. - ' + e.toString());
  }


};

Engine.prototype._waitForTopicsReadyF = function(required_topics){
  var engine = this;
  var delay = process.env.ROCON_AUTHORING_DELAY_AFTER_TOPICS || 2000;



  var fiber = Fiber.current;

  var timer = setInterval(function(){
    if(!fiber.stopped){
      engine.ros.getTopics(function(topics){
        var remapped_topics = R.filter(function(t){ return R.contains(t, required_topics); })(topics);
        console.log('topic count check : ', [remapped_topics.length, required_topics.length].join("/"), remapped_topics, required_topics);

        if(remapped_topics.length >= required_topics.length){
          clearInterval(timer);
          setTimeout(function(){ 
            if(!fiber.stopped){
              fiber.run(); 
            }else{
              fiber.throwInto('stopped');
            }
          }, delay);
        }
      });
    }else{
      clearInterval(timer);
      console.log('running fiber will stop');
      fiber.throwInto('stopped');

    }

  }, 1000);



  Fiber.yield();

};

Engine.prototype.allocateResource = function(rapp, uri, remappings, parameters, options){

  var engine = this;
  
  var r = new Requester(this);

  R.forEach(function(remap){
    if(R.isEmpty(remap.remap_to)){
      remap.remap_to = "/" + remap.remap_from + "_" + UUID.v4().replace(/-/g, "")
    }

  })(remappings);

  var res = new Resource();
  res.rapp = rapp;
  res.uri = uri;
  res.remappings = remappings;
  res.parameters = parameters;

  var future = new Future();
  r.send_allocation_request(res, options.timeout).then(function(reqId){
    engine.schedule_requests[reqId] = r;
    engine.schedule_requests_ref_counts[reqId] = 0;
    future.return({req_id: reqId, remappings: remappings, parameters: parameters, rapp: rapp, uri: uri, allocation_type: options.type});
  }).catch(function(e){
    future.return(null);
  });

  
  return future.wait();
};

Engine.prototype.releaseResource = function(ctx){
  var requester = this.schedule_requests[ctx.req_id];
  if(!ctx.allocation_type || ctx.allocation_type == 'dynamic'){
    this.schedule_requests_ref_counts[ctx.req_id] = this.schedule_requests_ref_counts[ctx.req_id] - 1;
    if(this.schedule_requests_ref_counts[ctx.req_id] <= 0){
      var requester = this.schedule_requests[ctx.req_id];
      requester.cancel_all();
    }
  }

};

Engine.prototype._scheduled = function(rapp, uri, remappings, parameters, topics_count, name, callback){
  var engine = this;
  
  var r = new Requester(this);

  this.ros.getTopics(function(topics){
    engine.log("topics : ", topics);

    var res = new Resource();
    res.rapp = rapp;
    res.uri = uri;
    res.remappings = remappings;

    console.log("remapping ", res.remappings);

    res.parameters = parameters;

    r.send_allocation_request(res).then(function(reqId){

      var topics_ready = new Promise(function(resolve, reject){

        var timer = setInterval(function(){
          engine.ros.getTopics(function(topics){

            
            var remapped_topics = R.filter(R.match("^"+name))(topics);
            console.log('topic count check : ', remapped_topics.length);

            if(remapped_topics.length >= topics_count){
              clearInterval(timer);
              resolve();
            }
          });
        }, 1000);


      });


      topics_ready.then(function(){
        callback(r);
      });
    });
  });


};

Engine.prototype.runScheduledAction = function(ctx, name, type, goal, onResult, onFeedback){

  var remapping_kv = R.compose(
    R.fromPairs,
    R.map(R.values)
  )(ctx.remappings);
  var name = remapping_kv[name];
  var engine = this;

  var required_topics = R.map(R.concat(name+"/"))(["feedback", "result", "status"]);
  engine.log('action : ', ctx, required_topics, name);


  engine._waitForTopicsReadyF(required_topics);
  this.schedule_requests_ref_counts[ctx.req_id] = this.schedule_requests_ref_counts[ctx.req_id] + 1;
  engine.runAction(name, type, goal, 
    function(items){ 
      onResult(items); 
      engine.releaseResource(ctx);
    }, 
    function(items){ onFeedback(items) });

  

};

Engine.prototype.scheduledSubscribe = function(ctx, topic, type, callback){
  var engine = this;
  var remapping_kv = R.compose(
    R.fromPairs,
    R.map(R.values)
  )(ctx.remappings);
  var name = remapping_kv[name];

  // engine._waitForTopicsReadyF([name]);
  
  var listener = new ROSLIB.Topic({
    ros : this.ros,
    name : topic,
    messageType : type
  });

  listener.subscribe(function(message) {
    engine.debug('Received message on ' + listener.name + ': ' + message);
    callback(message);
  });
  this.schedule_requests_ref_counts[ctx.req_id] = this.schedule_requests_ref_counts[ctx.req_id] + 1;

  this.topics.push({name: topic, listener: listener});
  
};


Engine.prototype.scheduledPublish = function(ctx, topic, type, msg){
  var engine = this;
  var remapping_kv = R.compose(
    R.fromPairs,
    R.map(R.values)
  )(ctx.remappings);
  var name = remapping_kv[topic];
  var engine = this;


  // engine._waitForTopicsReadyF([name]);
  engine.pub(name, type, msg);
  this.schedule_requests_ref_counts[ctx.req_id] = this.schedule_requests_ref_counts[ctx.req_id] + 1;

};





Engine.prototype.runAction = function(name, type, goal, onResult, onFeedback){
  this.log("run action : " +  name + " " + type + " " + JSON.stringify(goal));

  var ac = new ROSLIB.ActionClient({
    ros : this.ros,
    serverName : name,
    actionName : type
  });

  var goal = new ROSLIB.Goal({
    actionClient : ac,
    goalMessage : goal
  });

  goal.on('feedback', onFeedback);
  goal.on('result', onResult);

  goal.send();

};

Engine.prototype.cmdVel = function(options){

  var cmdVel = new ROSLIB.Topic({
    ros : this.ros,
    name : '/turtle1/cmd_vel',
    messageType : 'geometry_msgs/Twist'
  });

  var twist = new ROSLIB.Message(options);

  cmdVel.publish(twist);


};


Engine.prototype.publish = function(topic, type, msg){
  return this.pub(topic, type, msg);
};

// Engine.prototype.publish = function(event_name, params){
  // var data = {event: event_name};
  // _.assign(data, params);

// };
Engine.prototype.clear = function(){
  var that = this;

  // stop fibers
  this.executions.forEach(function(f){
    f.stopped = true;
  });
  this.executions = [];

  var q_cancels = R.map(function(r){
    try{ 
      return r.cancel_all(); 
    }catch(e){ return null; }
  })(R.values(this.schedule_requests));

  Promise.all(q_cancels).then(function(){
    that.ee.removeAllListeners();
    that.memory = {};
    that.unsubscribeAll();
    that.log('engine cleared');
  }).catch(function(e){
    that.log('fail - engine clear ' + e.toString());
    
  });;


};
Engine.prototype.print = function(msg){
  console.log(new Date().toString() + " - " + msg.green);

};

Engine.prototype.log = function(args){
  global.logger.info(args)
};

Engine.prototype.debug = function(args){
  global.logger.debug(args);
};

Engine.prototype.itemsToCode = function(items){
  var js = _.map(items, function(i){
    return "// "+i.title+"\n"+i.js;
  }).join("\n\n");


  return js;



};

Engine.prototype.runItems = function(items) {
  var scripts = this.itemsToCode(items);
  this.runCode(scripts);
};



Engine.prototype.getParam = function(k, cb){
  var param = new ROSLIB.Param({
    ros : this.ros,
    name : k
  });
  param.get(cb)
};


Engine.prototype.setParam = function(k, v, cb){
  var paramClient = new ROSLIB.Service({
    ros : this.ros,
    name : '/rosapi/set_param',
    serviceType : 'rosapi/SetParam'
  });

  var request = new ROSLIB.ServiceRequest({
    name : k,
    value : JSON.stringify(v)
  });

  paramClient.callService(request, cb);
};

Engine.prototype.load = function(){
  this.runBlocks(null);

};
Engine.prototype.reload = function(){
  var that = this;
  this.clear();
  this.load();
};




module.exports = Engine;
