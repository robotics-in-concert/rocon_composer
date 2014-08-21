var _ = require('lodash'),
  EventEmitter = require('events').EventEmitter,
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  express = require('express'),
  ROSLIB = require('roslib');

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


require('./routes')(app);

server = app.listen(process.env.PORT, function(){
  console.log('Listening on port %d (%s)', server.address().port, process.env.NODE_ENV);
});


/*
 *
 */

/*
 * Engine class
 */

var Engine = function(){
  this.ee = new EventEmitter();
  this.memory = {};
  var ros = this.ros = new ROSLIB.Ros();
  var engine = this;
  var topic = [];



   // First, we create a Param object with the name of the param.
  var engineStartedParam = new ROSLIB.Param({
    ros : ros,
    name : 'cento_engine_started'
  });


  ros.on('error', function(e){
    console.log('ros error', e);
  });
  ros.on('connection', function(){
    console.log('ros connected');
  });
  ros.on('close', function(){
    console.log('ros closed');
  });
  ros.connect(process.env.ROS_WS_URL);

};

Engine.prototype.subscribe = function(topic){
  var engine = this;
  var listener = new ROSLIB.Topic({
    ros : this.ros,
    name : topic,
    messageType : 'std_msgs/String'
  });

  listener.subscribe(function(message) {
    console.log('Received message on ' + listener.name + ': ' + message.data);
    engine.ee.emit(message.data);

  });

};


Engine.prototype.publish = function(topic){
  var topic = new ROSLIB.Topic({
    ros : this.ros,
    name : topic,
    messageType : 'std_msgs/String'
  });

  // Then we create the payload to be published. The object we pass in to ros.Message matches the 
  // fields defined in the geometry_msgs/Twist.msg definition.
  var msg = new ROSLIB.Message({
    data: ''
  });

  // And finally, publish.
  topic.publish(msg);


};

Engine.prototype.cmdVel = function(options){
  console.log('cmdVel', options);

  var cmdVel = new ROSLIB.Topic({
    ros : this.ros,
    name : '/turtle1/cmd_vel',
    messageType : 'geometry_msgs/Twist'
  });

  var twist = new ROSLIB.Message(options);
  console.log(twist);

  cmdVel.publish(twist);
  console.log('here');


};


Engine.prototype.publish = function(event_name, params){
  var data = {event: event_name};
  _.assign(data, params);

};
Engine.prototype.clear = function(){
  this.ee.removeAllListeners();
  this.memory = {};
  this.debug('engine cleared');

};
Engine.prototype.print = function(msg){
  console.log(msg.green);

};

Engine.prototype.log = function(args){
  console.log(args.green);
}
Engine.prototype.debug = function(args){
  console.log(args.grey);
}


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
  var that = this;
  this.getParam('cento_authoring_items', function(data){
    console.log(data.data);

    var scripts = _.map(data.data, function(row){
      return row.js;
    }).join("\n\n\n");

    console.log("---------------- scripts -----------------".grey);
    console.log(scripts.grey);
    console.log("------------------------------------------".grey);

    try{
      eval(scripts);
    }catch(e){
      console.log('invalid block scripts. failed.');
    }



    console.log("scripts evaluated.");


  });


};
Engine.prototype.reload = function(){
  var that = this;
  this.clear();
  this.load();
};


$engine = new Engine();



