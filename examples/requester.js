#!/usr/bin/env node

var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  express = require('express'),
  MongoClient = require('mongodb').MongoClient,
  clone = require('clone'),
  Engine = require('../engine');
  
var _R = require('../requester'),
    Requester = _R.Requester,
    Resource = _R.Resource;
    




// ROS_WS_URL="ws://192.168.10.112:9090"
// MONGO_URL="mongodb://localhost:27017/cento_authoring"

console.log("ros : ", process.env.ROS_WS_URL);

MongoClient.connect(process.env.MONGO_URL, function(e, db){
  if(e) throw e;
  console.log('mongo connected');


  $engine = new Engine(db);



  $engine.on('started', function(){
    console.log('engine started');

    var r = new Requester($engine);

    var res = new Resource();

    process.on('SIGINT', function() {
      console.log('interrupted, closing ros');


      r.finish();
      $engine.ros.close();
      process.exit();
      
    });
    
    res.rapp = 'concert_common_rapps/waiter';
    res.uri = 'rocon:/pc';
    res.addRemapping('delivery_order/goal', 'deli/goal');
    res.addRemapping('delivery_order/feedback', 'deli/feedback');
    // res.addParameter('key1', 'value1');

    console.log('here');

    r.send_allocation_request(res, function(err, reqId){
      if(err){
        console.error('resource allocation failed');
      }
      // here, resource is allocated

      engine.publish('to1');




      r.send_releasing_request(reqId, function(e){
        // done.

      });


    });

  });



});




