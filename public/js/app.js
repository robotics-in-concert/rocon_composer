JSONEditor.defaults.options.theme = 'bootstrap3';

R.mapProp = R.compose( R.map, R.prop );

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
  this.loadInteractions = function(){
    var that = this;
    var data = {};
    return $http.get('/api/load_interactions', data).then(function(res){
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
    var loadBlocks = function(url){
      var $tb = $('#toolbox');
      var generator = new BlockGenerator();
      
      blocksStore.loadRapp(url).then(function(x){
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

          });

        });
        console.groupEnd();


        console.log($('#toolbox').get(0));

        return blocksStore.loadInteractions();


      }).then(function(interactions){
        
        console.groupCollapsed('Load interactions');
        console.log(interactions);


        var data = R.map(function(i){
          i.interface = R.map(R.assoc('client_app_id', i._id))(i.interface);
          return i;
        })(interactions.data);
        console.log("DATA", data);


        var sub_topics_el = R.compose(
          R.map(function($el){ $tb.find('category[name=ROS]').append($el); }),
          R.map(R.bind(generator.subscribe_block_dom, generator)),
          R.reject(R.isEmpty),
          R.flatten,
          R.mapProp('interface')
        )(data);
        


        console.groupEnd();

        // IMPORTANT
        ros_block_override();


        Blockly.updateToolbox($('#toolbox').get(0));
      });;

    };
    _.defer(loadBlocks);


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

