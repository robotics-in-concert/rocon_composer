_js = function(prettify){
  var js = Blockly.JavaScript.workspaceToCode();
  if(prettify) js = js_beautify(js);
  return js;
};

_xml = function(prettify){
  var dom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var xml = Blockly.Xml.domToText(dom);
  if(prettify) xml = vkbeautify.xml(xml);
  return xml;
};

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

window.searching_keyword = null;


findNext = function(keyword){
  var blks = $(_xml()).find('block[type=text]');
  blks.each(function(){
    var txt = $(this).text().trim().toLowerCase();
    var id = $(this).attr('id');
    var b = Blockly.mainWorkspace.getBlockById(id);

    if( $(this).text().indexOf(keyword) >= 0 && b != Blockly.selected ){
      console.log(id);

      b.select();
      return false;
    }

  });

};

Mousetrap.bind('esc', function() { 
  if(Blockly.selected){
    Blockly.selected.unselect();
    window.searching_keyword = null;
  }

});
Mousetrap.bind('ctrl+alt+r', function() { 
  if(window.searching_keyword){
    findNext(window.searching_keyword);
  };

});

Mousetrap.bind('ctrl+alt+f', function() { 
  var keyword = prompt("search block").toLowerCase();
  window.searching_keyword = keyword;
  findNext(keyword);

  
});


Mousetrap.bind('?', function(){
  $('.shortcut-modal').modal();

});

Mousetrap.bind('ctrl+alt+j', function() { 
  $('.code-modal .modal-title').text('Javascript');
  var $code = $('.code-modal code');
  $code.text(_js(true));
  $code.attr('class', 'javascript');
  hljs.highlightBlock($('.code-modal code').get(0));
  jQuery('.code-modal').modal({});

});
Mousetrap.bind('ctrl+alt+l', function() { 
  $('.code-modal .modal-title').text('XML');

  var $code = $('.code-modal code');
  $code.text(_xml(true));
  $code.attr('class', 'xml');
  hljs.highlightBlock($('.code-modal code').get(0));
  jQuery('.code-modal').modal({});

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

  this.loadRapp = function(){
    var that = this;
    var data = {};
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


var reload_udf_blocks = function(items){


  $('category[name=UDF] block').remove();
  _.each(items, function(item){
    var parser = new DOMParser();
    var xml = parser.parseFromString(item.xml, "text/xml");

    $(xml).find('block[type=procedures_defreturn],block[type=procedures_defnoreturn]').each(function(b){
      var fname = $(this).find('> field[name]').text();
      var args = $(this).find('mutation arg').map(function(e){ return $(this).attr('name'); }).toArray();
      Blockly.register_function_block(fname, args, $(this).attr('type') == 'procedures_defreturn');

      var $cat = $('category[name=UDF]');
      $cat.append('<block type="udf_'+fname+'"></block>');


    });
    Blockly.updateToolbox($('#toolbox').get(0));

  });

};

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
        reload_udf_blocks($scope.items);

      }

      $scope.$watch('items', function(newValue, oldValue) {
        console.log('items watched');
        if (!_.isEqual(newValue, oldValue)) {
          console.log(oldValue, "->", newValue);

          blocksStore.setParam(ITEMS_PARAM_KEY, newValue).then(function(res){
            reload_udf_blocks($scope.items);
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
    $scope.exportItems = function(){
      var pom = document.createElement('a');
      console.log($scope.items);
      console.log('data:application/json;charset=utf-8,' + JSON.stringify($scope.items));


      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify($scope.items))
      pom.setAttribute('download', "items.json");
      pom.click();

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
        var items = JSON.parse(json);

        console.log("items to import ", items);

        $scope.$apply(function(){
          $scope.items = _.uniq(_.flatten([items, $scope.items]), 'title');

        });

        console.log($scope.items);




      }
      r.readAsText(f);




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
            Blockly.register_message_block(tt.type, tt, tt.text);
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
            if(meta.type.match(/.+Action$/) && fn != 'action_goal'){ // if action block
              return;
            }

            if(_.include(['action_feedback'], fn)){
              return;
            }
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

        var typesBlocks = {};
        _.each(x.types, function(subTypes, k){

          if(k.match(/.+Action$/)){
            var t = subTypes[k];
            var x = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes));
            var goal_t = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes))['action_goal'];
            t = subTypes[goal_t];
            goal_t = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes))['goal'];
            t = subTypes[goal_t];
            var $el = buildBlockTree(subTypes, t);

          }else{
            var $el = buildBlockTree(subTypes, subTypes[k]);
          }



          console.log($el.get(0));
          $el.attr('collapsed', true);
          $tb.find('category[name=ROS]').append($el.get(0));

          typesBlocks[k] = $el.get(0);

        });

        



        _.each(x.rapps, function(rapp){
          _.each(rapp.rocon_apps, function(rocon_app, key){
            var meta = rocon_app.interfaces;
            _.each(meta.action_servers, function(sub){
              var typeBlock = typesBlocks[sub.type];
              var $valueBlock = $('<value name="GOAL"></value>');
              $valueBlock.append(typeBlock);

              Blockly.register_scheduled_action_block([rapp.name, key].join("/"), "rocon:/pc", sub.name, sub.type);
              var $tb = $('#toolbox');
              var $block = $('<block type="ros_scheduled_action_'+sub.name+'"></block>');
              $block.append($valueBlock);
              $tb.find('category[name=ROS]').append($block);
              console.log("register action block", sub);


            });
            // _.each(meta.subscribers, function(sub){
              // Blockly.register_publish_block(sub.name, sub.type);
              // var typeBlock = typesBlocks[sub.type];
              // var $tb = $('#toolbox');
              // var $pubBlock = $('<block type="ros_publish_'+sub.name+'"></block>');
              // var $valueBlock = $('<value name="VALUE"></value>');
              // $valueBlock.append(typeBlock);
              // $pubBlock.append($valueBlock);
              // $tb.find('category[name=ROS]').append($pubBlock);
              // console.log("register publish block", sub);


            // });

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
    $scope.engineLoadChecked = function(){
      var items = $scope.itemSelection;
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
        $scope.current = data;
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
     * items checkbox
     */
    $scope.itemSelection = [];
    $scope.toggleItemSelection = function(title){
      console.log(title);

      _.include($scope.itemSelection, title) ?
        _.pull($scope.itemSelection, title) :
        $scope.itemSelection.push(title)

    };


    /**
     * workspace
     *
     */
    $scope.clearWorkspace = function() {
      Blockly.mainWorkspace.clear();
      $scope.current = null;
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

