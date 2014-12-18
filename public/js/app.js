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



var app = angular.module('centoAuthoring', ['ui.router', 'ui.select2']);


app.config(function($stateProvider, $interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');


  $stateProvider
    .state('services_index', {
      url: '/services_index',
      templateUrl: '/js/tpl/services_index.html'
    })
    .state('services', {
      url: '/services?new_name',
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
    .state('workflow_edit', {
      url: '/blockly/:id',
      templateUrl: '/js/tpl/blockly.html'

    })
    .state('workflow_blockly', {
      url: '/blockly?new_name',
      templateUrl: '/js/tpl/blockly.html'

    });
});
app.directive("roconSelect2", ["$interval", function($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            //On click
            $(elem).select2()
            $(elem).on('change', function(){
              console.log('hh');
              var v = $(elem).select2('val');
              console.log("v", v);


              scope.destPackage = $(elem).select2('val');

            });

        }
    }
}]);

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



