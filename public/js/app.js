$(function(){
  $('#right_switch a').click(function(){
    $('.right').toggle();

    if($('.right').is(':visible')){
      $('.left').css('width', '70%');
      $('.right').css('width', '30%');

    }else{
      $('.left').css('width', '100%');
    }
    Blockly.fireUiEvent(window, 'resize');

  });

});


Mousetrap.bind('ctrl+alt+d', function() { 
  var sel = Blockly.selected;
  Blockly.copy_(sel);
  if (Blockly.clipboard_) {
    Blockly.mainWorkspace.paste(Blockly.clipboard_);
  }
});
Mousetrap.bind('ctrl+alt+c', function() { 
  var sel = Blockly.selected;
  if(sel){
    sel.setCollapsed(!sel.collapsed_);

  }
});


var app = angular.module('centoAuthoring', []);

ITEMS_PARAM_KEY = 'cento_authoring_items';

app.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

app.service('blocksStore', function($http, $q){


  this.setParam = function(k, v){
    // var dfd = $q.defer();
    // localStorage.setItem(k, JSON.stringify(v));
    // dfd.resolve(true);
    // return dfd.promise;
    return $http.post('/api/param/'+k, {data: v}).then(function(res){
      return res.data;
    });
  }
  this.getParam = function(k){
    // var dfd = $q.defer();
    // var v = localStorage.getItem(k);
    // dfd.resolve(JSON.parse(v));
    // return dfd.promise;
    

    return $http.get('/api/param/'+k).then(function(res){
      if(res.data.data){
        return res.data.data;
      }
      return null;
    });
  }
  this.publish = function(topic){
    return $http.post('/api/publish', {topic: topic}).then(function(res){
      return res.data;
    });
  }

  this.loadRapp = function(url){
    var that = this;
    var data = {url: url};
    return $http.post('/api/load_rapp', data).then(function(res){
      return res.data;
    });
  };
  this.eval = function(code){
    var that = this;
    var data = {code: code};
    $http.post('/api/eval', data).then(function(res){
      return res.data;
    });
  };


});

app.controller('MainCtrl', function($scope, blocksStore, $http) {
    var items;
    $scope.foo = 'bar';
    $scope.current = null;
    $scope.rapp_url = "http://files.yujinrobot.com/rocon/rapp_repository/office_rapp.tar.gz";
    items = $scope.items = []
    $scope.robot_brain = {};



    blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
      console.log('loaded ', rows);
      if(!rows){
        $scope.items = [];
      }else{
        $scope.items = rows;

      }

      $scope.$watch('items', function(newValue, oldValue) {
        console.log('items watched');
        if (!_.isEqual(newValue, oldValue)) {
          console.log(oldValue, "->", newValue);

          blocksStore.setParam(ITEMS_PARAM_KEY, newValue).then(function(res){
            console.log('items saved', newValue, res);

          });
            
        }
      }, true);

    });

    $scope.import = function(){
      $('#file').click();

    };
    $scope.export = function(){
      var dom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
      var xml = Blockly.Xml.domToText(dom);
      var pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml));
      pom.setAttribute('download', "export.xml");
      pom.click();

    };
    $scope.fileNameChanged = function(e){
      console.log(e);
      var files = e.files;
      var f = files[0];

      var r = new FileReader();
      r.onload = function(e) { 
        var xml = e.target.result;
        Blockly.mainWorkspace.clear();
        var dom = Blockly.Xml.textToDom(xml);
        console.log(dom);

        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);


      }
      r.readAsText(f);




    };

    $scope.triggerEvent = function(topic) {
      blocksStore.publish(topic).then(function(){
        alert('ok');

      });
    };
    $scope.deleteItem = function(id) {
      $scope.items = _.reject($scope.items, {id: id})
      $scope.current = null;
    };
    $scope.loadRapp = function(url){
      blocksStore.loadRapp(url).then(function(x){
        console.log(x);

        var $tb = $('#toolbox');


        _.each(x.types, function(topType){
          _.each(topType, function(tt){
            Blockly.register_message_block(tt.type, tt);
            var blockKey = tt.type.replace('/', '-');
            console.log('register msg block', tt.type);

          });
        });


        var singleBlock = function(fieldtype){
            if(fieldtype.match(/string/)){
              return $('<block type="text"><field name="TEXT"></field></block>');
            }else if(fieldtype.match(/float|uint|int|time/)){
              return $('<block type="math_number"><field name="NUM">0</field></block>');
            }
        };

        var buildBlockTree = function(lst, meta, parent){
          console.log('build block tree', meta);

          if(!parent)
            var p = $('<block />').attr('type', 'ros_msg_'+meta.type.replace('/', '-'));
          else
            p = parent;

          
          
          _.each(meta.fieldtypes, function(fieldtype, idx){
            var arrlen = meta.fieldarraylen[idx];
            var fn = meta.fieldnames[idx];
            var $val = null;
            var $child = null;


            if(arrlen == -1){
              $child = $val = $('<value name="'+fn.toUpperCase()+'" />');
            }else if(arrlen >= 0){
              $child = $('<value name="'+fn.toUpperCase()+'"></value>');
              var $list = $('<block type="lists_create_with"><mutation items="1"></mutation><value name="ADD0"></value></block>');
              $val = $list.find('value[name=ADD0]');
              $child.append($list);

            }



            if(fieldtype.match(/.+\/.+/)){
              var subtype = _.detect(lst, function(e, k){ console.log(k, meta.fieldtypes[idx]); return meta.fieldtypes[idx] == k })
              var $subDom = buildBlockTree(lst, subtype);
              $val.append($subDom);
            }else{
              $val.append(singleBlock(fieldtype));

            }
            p.append($child);


          });


          console.info("built", meta.type, p.get(0));

          return p;
        };


        // var $el = buildBlockTree(x.types['nav_msgs/MapMetaData'], x.types['nav_msgs/MapMetaData']['nav_msgs/MapMetaData']);
        // console.log($el.get(0));
        // $tb.find('category[name=ROS]').append($el.get(0));

        // var $el = buildBlockTree(x.types['std_msgs/String'], x.types['std_msgs/String']['std_msgs/String']);
        // console.log($el.get(0));
        // $tb.find('category[name=ROS]').append($el.get(0));

        _.each(x.types, function(subTypes, k){
          var $el = buildBlockTree(subTypes, subTypes[k]);
          console.log($el.get(0));
          $el.attr('collapsed', true);
          $tb.find('category[name=ROS]').append($el.get(0));

        });

        



        _.each(x.interfaces, function(meta){
          _.each(meta.subscribers, function(sub){
            Blockly.register_publish_block(sub.name, sub.type);
            var $tb = $('#toolbox');
            $tb.find('category[name=ROS]').append('<block type="ros_publish_'+sub.name+'"></block>');
            console.log("register publish block", sub);


          });

        });


        console.log($('#toolbox').get(0));

        Blockly.updateToolbox($('#toolbox').get(0));


      });

    };


    $scope.engineLoad = function(){
      $http.post('/api/engine/load').then(function(){
        alert('ok');
      });

    };
    $scope.engineReset = function(){
      $http.post('/api/engine/reset').then(function(){
        alert('ok');
      });

    };
    $scope.newData = function() {
      return $scope.current = null;
    };
    $scope.save = function() {
      var id = $scope.current.id;
      var js = Blockly.JavaScript.workspaceToCode();
      var dom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
      var xml = Blockly.Xml.domToText(dom);
      console.log('current.id', $scope.current.id);
      if (id != null) {
        var idx = _.findIndex($scope.items, {id: $scope.current.id});
        $scope.items[idx] = {id: id, js: js, xml: xml, title: $scope.current.title};
      } else {
        var data = {
          id: new Date().getTime() + "",
          js: js,
          xml: xml,
          title: $scope.current.title };
        
        $scope.items.push(data);
      }
    };
    $scope.load = function(id) {
      console.log(id);

      var data, dom, js;
      js = Blockly.JavaScript.workspaceToCode();
      console.log($scope.items);

      data = _.where($scope.items, {
        id: id
      })[0];
      $scope.current = data;
      console.log(data);


      dom = Blockly.Xml.textToDom(data.xml);
      Blockly.mainWorkspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
    };


    /**
     * workspace
     *
     */
    $scope.clearWorkspace = function() {
      Blockly.mainWorkspace.clear();
    };
    $scope.runCurrent = function() {
      var code;
      code = Blockly.JavaScript.workspaceToCode();
      console.log(code);
      blocksStore.eval(code);

    };

    $scope.trigger = function(action) {
      var en;
      en = action;
      if (arguments[1] != null) {
        en = "" + en + ":" + arguments[1];
      }
      console.debug("emit", en);
      return $scope.$emit(en);
    };
});

