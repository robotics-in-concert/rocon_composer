
var app = angular.module('centoAuthoring');
app.controller('WorkflowBlocklyCtrl', function($scope, blocksStore, $http, $rootScope, $stateParams) {
  $rootScope.$on('$stateChangeStart', function(e, to) {
    var dirty = checkDirty()
    if(dirty){
      if(dirty == 'not exists'){
        var msg =  'unsaved - want leave?';
      }else if(dirty == 'changed'){
        var msg =  'changed - want leave?';
      }
      if(!confirm(msg)){
        e.preventDefault();
      }
      window.onbeforeunload = null;

    }

  });

  window.onbeforeunload = function(e){
    var dirty = checkDirty()
    if(dirty){
      if(dirty == 'not exists'){
        return 'unsaved';
      }else if(dirty == 'changed'){
        return 'changed';
      }
    }
    window.onbeforeunload = null;
    return null;
  };

  var checkDirty = function(){
    var exists = R.find(R.propEq('id', $scope.current.id))($scope.items);
    if(!exists){
      return 'not exists';
    }

    if(exists.xml != _xml()){
      return 'changed';
    }

    return false;
  };

  $scope.foo = 'bar';

  $scope.itemSelection = [];
  $scope.rapp_url = "http://files.yujinrobot.com/rocon/rapp_repository/office_rapp.tar.gz";
  $scope.robot_brain = {};



  $rootScope.$on('items:loaded', function(){
    reload_udf_blocks($scope.items);
    if($stateParams.id){ // load
      $scope.load($stateParams.id);
    }
  });
  $rootScope.$on('items:saved', function(){
    reload_udf_blocks($scope.items);

    $('#alert .alert').html('Saved');
    $('#alert').show().delay(500).fadeOut('fast');

  });

  var resetCurrent = function(){
    $scope.current = {id: new Date().getTime() + "", title: 'Untitled', description: 'Service Description'};
  };
  resetCurrent();
  if($stateParams.new_name){
    $scope.current.title = $stateParams.new_name;
  }


  var setupEditable = function(re){
    $('#description, #title').editable('destroy');

    $('#title').editable({
      display: function(){
        $(this).html($scope.current.title);
      },
      value: $scope.current.title,
      success: function(res, newv){
        $scope.current.title = newv;
      }
    });
    $('#description').editable({
      display: function(){
        $(this).html($scope.current.description);
      },
      value: $scope.current.description,
      success: function(res, newv){
        $scope.current.description = newv;
      }
    });

  };

  $rootScope.$on('$viewContentLoaded', function() {
    setupEditable();
  });

  $scope.save = function() {


    var id = $scope.current.id;
    var title = $scope.current.title;
    var description = $scope.current.description;
    try {
      var js = _js();
      var xml = _xml();
    }catch(e){
      alert('failed to save : ' + e.message);

      return null;

    }


    var idx = _.findIndex($scope.items, {id: id});
    if(idx >= 0){
      $scope.items[idx] = {id: id, js: js, xml: xml, title: $scope.current.title, description: description};
      console.log(1);


    }
    else {
      
      $scope.items.push({id: id, title: title, js: js, xml: xml, description: description});
      console.log(2);

    }
    
  };
  Mousetrap.bind('ctrl+s', function(){
    console.log('save triggered');
    $scope.$apply(function(){
      $scope.save();
    });

  });




    var loadBlocks = function(url){
      var $tb = $('#toolbox');
      var generator = new BlockGenerator();
      
      blocksStore.loadRapp(url)
        .catch(function(e){
          console.log('cannot load blocks - msg database error');

        })
        .then(function(x){
          console.groupCollapsed("Rapp Blocks");

          generator.generate_message_blocks(x.types);

          R.mapObj.idx(function(subTypes, k){
            var $el = generator.message_block_dom(k, subTypes);
          })(x.types);

          /*
           * Rapp blocks
           */
          _.each(x.rapps, function(rapp){
            _.each(rapp.rocon_apps, function(rocon_app, key){
              var meta = rocon_app.interfaces;
              _.each(meta.action_servers, function(sub){

                var $b = generator.scheduled_action_block_dom(
                  [rapp.name, key].join("/"),
                  "rocon:/pc",
                  sub.name,
                  sub.type);
                $tb.find('category[name=ROS]').append($b);

              });
              _.each(meta.publishers, function(sub){

                var $b = generator.scheduled_subscribe_block_dom(
                  [rapp.name, key].join("/"),
                  "rocon:/pc",
                  sub.name,
                  sub.type);
                $tb.find('category[name=ROS]').append($b);

              });

              _.each(meta.subscribers, function(sub){

                var $b = generator.scheduled_publish_block_dom(
                  [rapp.name, key].join("/"),
                  "rocon:/pc",
                  sub.name,
                  sub.type);
                $tb.find('category[name=ROS]').append($b);

              });

            });

          });
          console.groupEnd();


          console.log($('#toolbox').get(0));

          return blocksStore.loadInteractions();


        })
        .then(function(interactions){
        
          console.groupCollapsed('Load interactions');
          console.log(interactions);



          var sub_topics_el = R.compose(
            R.map(function($el){ $tb.find('category[name=ROS]').append($el); }),
            R.map(R.bind(generator.subscribe_block_dom, generator)),
            R.reject(R.isEmpty),
            R.flatten,
            R.mapProp('interface'),
            R.map(function(i){ i.interface = R.map(R.assoc('client_app_id', i._id))(i.interface); return i;})
          )(interactions.data);
          


          console.groupEnd();

          // IMPORTANT
          ros_block_override();


          Blockly.updateToolbox($('#toolbox').get(0));
        });;

    };
  _.defer(loadBlocks);


  $scope.engineLoadChecked = function(){
    var items = $scope.itemSelection;
    console.log(items);

    if(items.length < 1){
      alert('select items to load.');
    }else{
      $http.post('/api/engine/load', {blocks: $scope.itemSelection}).then(function(){
        alert('ok');
      });
    }

  };
  $scope.engineReset = function(){
    $http.post('/api/engine/reset').then(function(){
      alert('ok');
    });

  };

  /**
   * workspace
   *
   */
  $scope.clearWorkspace = function() {
    Blockly.mainWorkspace.clear();
  };

  // $scope.runCurrent = function() {
    // var code;
    // code = Blockly.JavaScript.workspaceToCode();
    // console.log(code);
    // blocksStore.eval(code);

  // };

  $scope.deleteItem = function(id) {
    $scope.items = _.reject($scope.items, {id: id})
    $scope.current = null;
  };

  $scope.newData = function() {
    Blockly.mainWorkspace.clear();
    resetCurrent();
    setupEditable();

  };
  $scope.load = function(id) {

    var data = R.find(R.propEq('id', id))($scope.items);
    $scope.current = data;
    setupEditable(true);
    console.log(data);


    dom = Blockly.Xml.textToDom(data.xml);
    Blockly.mainWorkspace.clear();

    try{
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
    }catch(e){
      alert('failed to load blocks - '+e.toString());

    }
  };





  /**
   * items checkbox
   */
  $scope.toggleItemSelection = function(id){

    _.include($scope.itemSelection, id) ?
      _.pull($scope.itemSelection, id) :
      $scope.itemSelection.push(id)

  };


  $scope.exportItems = function(){
    var pom = document.createElement('a');
    R.map(function(id){
      var item = R.find(R.propEq('id', id))($scope.items);


      console.log('data:application/json;charset=utf-8,' + JSON.stringify(item));
      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(item))
      pom.setAttribute('download', item.title + ".json");
      pom.click();

    })($scope.itemSelection);

    _.times(2, function(){
    });

  };
  $scope.importItems = function(){
    $('#itemsFile').click()
  };
  $scope.itemsFileNameChanged = function(e){
    var files = e.files;
    var f = files[0];

    var r = new FileReader();
    r.onload = function(e) { 
      var json = e.target.result;
      var item = JSON.parse(json);

      $scope.$apply(function(){
        item.id = new Date().getTime().toString();
        $scope.items.push(item);

      });

      console.log($scope.items);




    }
    r.readAsText(f);




  };
});

