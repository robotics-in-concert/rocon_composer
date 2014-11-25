var _R = require('requester'),
    Requester = _R.Requester,
    Resource = _R.Resource;

var r = new Requester(...);

var res = new Resource();
res.rapp = 'rapp';
res.addRemapping('from1', 'to1');
res.addRemapping('from2', 'to2');
res.addParameter('key1', 'value1');

r.send_allocation_request(res, function(err, reqId){
  if(err){
    console.error('resource allocation failed');
  }
  // here, resource is allocated

  engine.publish('to1', ....);




  r.send_releasing_request(reqId, function(e){
    // done.

  });


});
