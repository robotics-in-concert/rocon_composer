#!/usr/bin/env node

var R = require('ramda'),
  argv = require('minimist')(process.argv.slice(2)),
  Promise = require('bluebird'),
  MongoClient = require('mongodb').MongoClient,
  uuid = require('node-uuid'),
  fs = require('fs');


function _process(argv){
  if(!argv.a && !argv.d && !argv.l){
    return;
  }
  var mongo_url = process.env.ROCON_AUTHORING_MONGO_URL;
  if(argv.mongo_url){
    mongo_url = argv.mongo_url;
  }

  console.log("mongo url : " + mongo_url);

  MongoClient.connect(mongo_url, function(e, db){

    var col = db.collection('settings');
    var col = Promise.promisifyAll(col);
    var items_param_key = 'cento_authoring_items';
    var _load = function(cb){
      return col.findOneAsync({key: items_param_key})

        .then(function(doc){ 
          if(!doc){
            return [];
          }
          return doc.value.data; 
        });
    };

    var _update = function(items, cb){
      return col.updateAsync({key: items_param_key}, {$set: {value: {data: items}}}, {w:1, upsert: true});
    }



    if(argv.a || argv.d){ // add or delete

      _load()
        .then(function(list){


          if(argv.a){
            var files = [].concat(argv.a);
            var newData = files.forEach(function(fn){
              var json = fs.readFileSync(fn);
              var data = JSON.parse(json);
              data.id = uuid.v4().replace(/-/g, "");
              list.push(data);

              console.log(data.title + ' added');
            });
            
          }

          if(argv.d){

            var ids = [].concat(argv.d);
            ids.forEach(function(id){
              list = R.reject(function(e){ return ''+e.id == ''+id; })(list);
              console.log(id + ' deleted');
            });
            
          }
          return list;
        })
        .then(function(list){
          return _update(list);
        })
        .catch(function(e){
          console.log('failed', e);
        })
        .finally(function(){
          process.exit();
        });

          





    }
    if(argv.l){
      _load().then(function(list){

        list.forEach(function(item){
          console.log(item.id + ' : ' +item.title);
        });

      }).finally(function(){
        process.exit();
      });

    }

  });
};


_process(argv);
