var R = require('ramda');
var fs = require('fs');

module.exports = function(db, argv){
  var col = db.collection('settings');
  var items_param_key = 'cento_authoring_items';



  var _load = function(cb){
    col.findOne({key: items_param_key}, function(err, doc){
      if(!doc){
        cb(err);
      }else{
        cb(null, doc.value.data);
      }

    });
  };

  var _update = function(items, cb){
    col.update({key: items_param_key}, {$set: {value: {data: items}}}, {w: 1, upsert: true}, function(err, doc){
      cb(err, doc);
    });
  }

  if(argv.a){ // add
    var filelist = argv._.concat(argv.a);





    _load(function(e, list){
      list = list ? list : [];

      var newData = filelist.forEach(function(fn){
        var json = fs.readFileSync(fn);
        var data = JSON.parse(json);


        var idx = R.findIndex(R.propEq('id', data.id))(list);

        if(idx >= 0){
          list[idx] = R.mixin(list[idx], data);
        }else{
          list.push(data);
        }



        _update(list, function(e){
          if(e){
          }else{
            console.log(filelist.length + ' item(s) added');
          }

          process.exit();


        });
      });


        



    });

  }
  else if(argv.d){
    var id = argv.d;
    _load(function(e, list){
      console.log(id);

      var list2 = R.reject(R.propEq('id', ''+id))(list);


      _update(list2, function(e){
        if(e){
          console.log('error', e);

        }else{
          console.log('deleted');

        }
        process.exit();

      });

    });
  }
  else if(argv.l){
    _load(function(e, list){
      list.forEach(function(item){
        console.log(item.id + ' : ' +item.title);
      });

      process.exit();

    });

  }

};
