
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

    $scope.deleteItem = function(id) {
      $scope.items = _.reject($scope.items, {id: id})
      $scope.current = null;
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

});
