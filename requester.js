// TODO
// * heartbeat check
// * cancel

var _ = require('lodash'),
    async = require('async'),
    UUID = require('node-uuid');
    

new_uuid = function(){
  var _uuid = new Array(16);
  UUID.v4(null, _uuid);
  return _uuid;
};

// https://github.com/robotics-in-concert/rocon_scheduler_requests/blob/hydro-devel/src/rocon_scheduler_requests/requester.py
MSG_SCHEDULER_REQUEST = "scheduler_msgs/SchedulerRequests";
// SCHEDULER_TOPIC = 'rocon_scheduler';
SCHEDULER_TOPIC = '/concert/scheduler/requests'
HEARTBEAT_HZ =  1.0 / 4.0;
RESOURCE_STATUS_CHECK_INTERVAL = 500;



// Status value labels:
STATUS_NEW         = 0   // New request for the scheduler
STATUS_RESERVED    = 1   // Request for a reservation at some future time
STATUS_WAITING     = 2   // Request has been queued by the scheduler
STATUS_GRANTED     = 3   // Request was granted by the scheduler
STATUS_PREEMPTING  = 4   // The scheduler wants to preempt this
                        //   previously-granted request, but the
                        //   requester has not yet canceled it
STATUS_CANCELING   = 5   // The requester wishes to cancel this
                        //   request, but the scheduler has not yet
                        //   confirmed that it is closed
STATUS_CLOSED      = 6   // Request is now closed (terminal state)

// Reason labels:
REASON_NONE        = 0   // No reason provided
REASON_PREEMPTED   = 1   // Preempted for higher-priority task
REASON_BUSY        = 2   // Requested resource busy elsewhere
REASON_UNAVAILABLE = 3   // Requested resource not available
REASON_TIMEOUT     = 4   // Lost contact with requester
REASON_INVALID     = 5   // Ill-formed request: see problem string for details


// Priority labels:
PRI_BACKGROUND_PRIORITY = -20000      // When nothing else to do
PRI_LOW_PRIORITY = -10000             // Low-priority task
PRI_DEFAULT_PRIORITY = 0              // Sane default priority
PRI_HIGH_PRIORITY = 10000             // High-priority task
PRI_CRITICAL_PRIORITY = 20000         // Mission-critical task

/*
 * Resource
 *
 */

Resource = function(){
  this.rapp = null;
  this.id = null;
  this.uri = null;
  this.remappings = [];
  this.parameters = [];
};

Resource.prototype.addRemapping = function(from, to){
  this.remappings.push({remap_from: from, remap_to: to});
};
Resource.prototype.addParameter = function(k, v){
  this.remappings.push({key: k, value: v});
};
Resource.prototype.to_msg = function(){
  var msg = _.pick(this, 'rapp', 'id', 'uri', 'remappings', 'parameters');
  return msg;
};


/*
 * SchedulerRequests
 *
 */

Request = function(){

  this.id = new_uuid();
  this.resources = [];
  this.status = STATUS_NEW;
  this.reason = null;
  this.problem = null;
  this.availability = 0;
  this.hold_time = 0;
  this.priority = PRI_DEFAULT_PRIORITY;

};

Request.prototype.to_msg = function(){
  var msg = _.pick(this, "id,status,reason,problem,availability,hold_time,priority".split(/,/));
  msg.resources = _.map(this.resources, function(e){ return e.to_msg(); });
  return msg;
};

Request.prototype.cancel = function(){
  this.status = STATUS_CANCELING;

};


/*
 * SchedulerRequests (List)
 *
 */

SchedulerRequests = function(requester, resp){
  this.requester = requster;
  this.requests = {};
};

SchedulerRequests.prototype.to_msg = function(){
  return {
    requester: this.requester,
    requests: _.map(_.values(this.requests), function(e){ return e.to_msg(); })
  };
};
SchedulerRequests.prototype.deepClone = function(){
  return _.cloneDeep(this);
};
SchedulerRequests.prototype.merge = function(props){
  return _.merge(_.cloneDeep(this), props);
};

SchedulerRequests.prototype.cancel_all = function(){
  _.each(this.requests, function(v, k){
    v.cancel();
  });

};



/*
 * Requester
 *
 */

Requester = function(engine, uuid, options){
  this.engine = engine;
  this.ros = engine.ros;
  this.id = new_uuid();
  this.requests = new SchedulerRequests(this.id);

  this.pending_requests = []; // uuid list
  this.allocated_requests = []; // uuid list


  var default_options = {
    priority: 0,
    frequency: HEARTBEAT_HZ,
    lock: null,
    topic: null
  };

  this.options = _.defaults(options, default_options);


  // subscribe feedback topic
  this.engine.subscribe(this.feedback_topic(), MSG_SCHEDULER_REQUEST);
  this.engine.ee.on(this.feedback_topic(), _.bind(this._handleFeedback, this)); 
};

Requester.prototype.send_allocation_request = function(res, callback){
  var that = this;
  var reqId = this.new_request([res]);
  this.pending_requests.push(reqId);
  this.send_requests();


  async.until(
    function(){ return !_.include(that.pending_requests, reqId); },
    function(cb){ setTimeout(cb, RESOURCE_STATUS_CHECK_INTERVAL); },
    function(e){ 
      that.allocated_requests.push(reqId);
      callback(e, reqId); 
    }
  );



  // TODO : check GRANTED status on feedback function with timeout


  return reqId;
};

Requester.prototype.send_releasing_request = function(reqId, callback){
  var that = this;
  this.requests[reqId].cancel();
  this.send_requests();
  async.until(
    function(){ return _.include(that.allocated_requests, reqId); },
    function(cb){ setTimeout(cb, RESOURCE_STATUS_CHECK_INTERVAL); },
    function(e){ 
      callback(e, null); 
    }
  );
};

Requester.prototype.send_requests = function(){
  this.engine.publish(SCHEDULER_TOPIC, MSG_SCHEDULER_REQUEST, requests.to_msg());
};

Requester.prototype.new_request = function(resources){
  var uuid = new_uuid();
  var req = new Request(uuid);
  req.resources = resources;

  this.requests[UUID.unparse(uuid)] = req;

  return UUID.unparse(uuid);
};

Requester.prototype._handleFeedback = function(msg){
  var prev_rs = this.requests.deepClone();
  this.requests = this.requests.merge(msg);
  if(!_.isEqual(prev_rs, this.requests)){ // if diff
    this.handleFeedback(this.requests);
    this.send_requests();
  }

};


// TODO : template method? (subclass) or ....

Request.prototype.handleFeedback = function(requests){
  var that = this;

  _.each(requests.requests, function(req, uuid){

    if(req.status == STATUS_GRANTED){
      // handle granted resource
      _.pull(that.pending_requests, uuid);

    }else if(req.status == STATUS_CLOSED){
      // handle closed resource
      _.pull(that.pending_requests, uuid);
      _.pull(that.allocated_requests, uuid);

    };

  });

};

Requester.prototype.feedback_topic = function(){
  return [SCHEDULER_TOPIC, UUID.unparse(this.id)].join("_");

};

Requester.prototype.cancel_all = function(){
  this.requests.cancel_all();
  this.send_requests();

};




module.exports = {
  Requester: Requester
};
