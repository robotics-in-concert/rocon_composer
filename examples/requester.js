#!/usr/bin/env node

var _ = require('lodash'),
  MongoClient = require('mongodb').MongoClient,
  colors = require('colors'),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  express = require('express'),
  MongoClient = require('mongodb').MongoClient,
  Engine = require('../engine');
  
var _R = require('../requester'),
    Requester = _R.Requester,
    Resource = _R.Resource;


// ROS_WS_URL="ws://192.168.10.112:9090"
// MONGO_URL="mongodb://localhost:27017/cento_authoring"

MongoClient.connect(process.env.MONGO_URL, function(e, db){
  if(e) throw e;
  console.log('mongo connected');


  $engine = new Engine(db);


  $engine.on('started', function(){
    console.log('engine started');

    var r = new Requester($engine);

    var res = new Resource();
    res.rapp = 'concert_common_rapps/waiter';
    res.uri = 'rocon:/pc';
    res.addRemapping('/send_order', '/ssseeennnddd');
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




