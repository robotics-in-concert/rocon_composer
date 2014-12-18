ITEMS_PARAM_KEY = 'cento_authoring_items';
SERVICES_PARAM_KEY = 'cento_authoring_services';

JSONEditor.defaults.options.theme = 'bootstrap3';
$.fn.editable.defaults.mode = 'inline';
$.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="fa fa-check"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel"><i class="fa fa-remove"></i></button>'

R.mapProp = R.compose( R.map, R.prop );

var _uuid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
      return [s4() + s4(),
        s4(),
        s4(),
        s4(),
        s4() + s4() + s4()].join("");
  };
})();


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

var reload_udf_blocks = function(items){

  var $cat = $('category[name=Utils]');

  // $('category[name=Utils] block').remove();
  _.each(items, function(item){
    var parser = new DOMParser();
    var xml = parser.parseFromString(item.xml, "text/xml");

    $(xml).find('block[type=procedures_defreturn],block[type=procedures_defnoreturn]').each(function(b){
      var fname = $(this).find('> field[name]').text();
      var args = $(this).find('mutation arg').map(function(e){ return $(this).attr('name'); }).toArray();
      Blockly.register_function_block(fname, args, $(this).attr('type') == 'procedures_defreturn');

      
      $cat.find('block[type=udf_' + fname + ']').remove();
      $cat.append('<block type="udf_'+fname+'"></block>');


    });
    Blockly.updateToolbox($('#toolbox').get(0));

  });

};


var toggle_header_menu = function(){
  $('#header').toggle();
  if($('#header').is(':visible')){
    $('#header_toggler').hide();
    $('.container0').addClass('down');
  }else{
    $('#header_toggler').show();
    $('.container0').removeClass('down');
  }
  Blockly.fireUiEvent(window, 'resize');
  return false;

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

  $('.toggle_header').click(toggle_header_menu);

  $(document.body).on('click', '.toggle_header', toggle_header_menu);
  $(document.body).on('click', '.toggle_right', function(){ $('.container0 .right').toggle(); });



});
Mousetrap.bind('ctrl+alt+t', function(){
  toggle_header_menu();
  return false;

});
Mousetrap.bind('ctrl+alt+y', function(){
  $('.container0 .right').toggle();
  return false;

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



var app = angular.module('centoAuthoring', ['ui.router']);


app.config(function($stateProvider, $interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');


  $stateProvider
    .state('services_index', {
      url: '/services_index',
      templateUrl: '/js/tpl/services_index.html'
    })
    .state('services', {
      url: '/services',
      templateUrl: '/js/tpl/services.html'
    })
    .state('services_edit', {
      url: '/services/:service_id',
      templateUrl: '/js/tpl/services.html'
    })
    .state('workflow_index', {
      url: '',
      templateUrl: '/js/tpl/workflow_index.html'

    })
    .state('workflow_blockly', {
      url: '/blockly',
      templateUrl: '/js/tpl/blockly.html'

    });
});

app.service('serviceAuthoring', function($http, $q){

  this.saveService = function(serviceMeta, package){
    return $http.post('/api/services/save', {service: serviceMeta, package: package}).then(function(res){
      return res.data;
    });

  };

  this.getPackages = function(serviceMeta){
    return $http.get('/api/packages').then(function(res){
      return res.data;
    });

  };

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



app.controller('MainCtrl', function($scope, blocksStore, $http, $rootScope) {

    var items;
    $scope.foo = 'bar';

    $scope.itemSelection = [];
    $scope.rapp_url = "http://files.yujinrobot.com/rocon/rapp_repository/office_rapp.tar.gz";
    items = $scope.items = []
    $scope.robot_brain = {};

    var resetCurrent = function(){
      $scope.current = {id: new Date().getTime() + "", title: 'Untitled', description: 'Service Description'};
    };
    resetCurrent();

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
    $scope.save = function() {


      var id = $scope.current.id;
      var title = $scope.current.title;
      var description = $scope.current.description;
      var js = _js();
      var xml = _xml();


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



    //
    // import item to workspace
    //
    // $scope.import = function(){
      // $('#file').click();

    // };
    // $scope.export = function(){
      // var dom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
      // var xml = Blockly.Xml.domToText(dom);
      // var pom = document.createElement('a');
      // pom.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml));
      // pom.setAttribute('download', "export.xml");
      // pom.click();

    // };
    // $scope.fileNameChanged = function(e){
      // console.log(e);
      // var files = e.files;
      // var f = files[0];

      // var r = new FileReader();
      // r.onload = function(e) { 
        // var xml = e.target.result;
        // Blockly.mainWorkspace.clear();
        // var dom = Blockly.Xml.textToDom(xml);
        // console.log(dom);

        // Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);


      // }
      // r.readAsText(f);




    // };

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


      }).then(function(interactions){
        
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


    // $scope.engineLoad = function(){
      // $http.post('/api/engine/load').then(function(){
        // alert('ok');
      // });

    // };
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
      console.log(id);

      var data, dom, js;
      js = Blockly.JavaScript.workspaceToCode();
      console.log($scope.items);

      data = _.where($scope.items, {
        id: id
      })[0];
      $scope.current = data;
      setupEditable(true);
      console.log(data);


      dom = Blockly.Xml.textToDom(data.xml);
      Blockly.mainWorkspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
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
          item.id = new Date().getTime();
          $scope.items.push(item);

        });

        console.log($scope.items);




      }
      r.readAsText(f);




    };
});

