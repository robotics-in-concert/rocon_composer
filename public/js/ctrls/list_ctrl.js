
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

var app = angular.module('centoAuthoring');
app.controller('ListCtrl', function($scope, blocksStore, $http) {


});
