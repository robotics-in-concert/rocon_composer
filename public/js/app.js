var app = angular.module('centoAuthoring', []);


app.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

app.service('blocksStore', function($http){


  this.list = function(){
    return $http.get('/api/blocks').then(function(res){
      return res.data;
    });
  }
  this.get = function(id){
    return $http.get("/api/blocks/"+id).then(function(res){
      return res.data[0];
    });
  }
  this.update = function(id, data){
    var that = this;
    return $http.put("/api/blocks/"+id, data).then(function(res){
      return that.reload().then(function(){
        return res.data[0];
      });
    });
  }
  this.remove = function(id){
    var that = this;
    return $http.delete("/api/blocks/"+id).then(function(res){
      return that.reload().then(function(){
        return res.data[0];
      });
    });
  }
  this.reload = function(id){
    var that = this;
    return $http.get("/api/reload").then(function(res){
      return res.data;
    });
  }
  this.insert = function(data){
    var that = this;
    return $http.post('/api/blocks', data).then(function(res){
      return that.reload().then(function(){
        return res.data;
      });
    });
  }


});

app.controller('MainCtrl', function($scope, blocksStore) {
    var items;
    $scope.foo = 'bar';
    $scope.current = null;
    items = $scope.items = []
    $scope.robot_brain = {};


    var load = function(){
      blocksStore.list().then(function(rows){
        $scope.blocks = rows;

      });

    };
    load();

    $scope.deleteItem = function(id) {
      console.log('will delete ', id);

      blocksStore.remove(id).then(function(res){
        load();
      });
      
    };
    $scope.clear = function() {
      $scope.items = [];
    };
    $scope.clearWorkspace = function() {
      Blockly.mainWorkspace.clear();
    };
    $scope.$watch('items', function(newValue, oldValue) {
      console.log('items watched');
      if (!_.isEqual(newValue, oldValue)) {
        console.log('items here');
      }
    }, true);
    $scope.test = function() {
      return $scope.xx = new Date();
    };
    $scope.newData = function() {
      return $scope.current = null;
    };
    $scope.save = function() {
      var data, dom, idx, js, xml;
      js = Blockly.JavaScript.workspaceToCode();
      dom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
      xml = Blockly.Xml.domToText(dom);
      console.log('current.id', $scope.current.id);
      if ($scope.current.id != null) {
        blocksStore.update($scope.current.id, {js: js, xml: xml, title: $scope.current.title}).then(function(r){
          console.log('updated');


        });
      } else {
        var data = {
          js: js,
          xml: xml,
          title: $scope.current.title };
        blocksStore.insert(data).then(function(res){
          data.id = res.id
          $scope.current = data

          load();
        });
        
        return $scope.items.push(data);
      }
    };
    $scope.load = function(id) {
      console.log(id);

      var data, dom, js;
      js = Blockly.JavaScript.workspaceToCode();
      data = _.where($scope.blocks, {
        id: id
      })[0];
      $scope.current = data;
      console.log(data);


      dom = Blockly.Xml.textToDom(data.xml);
      Blockly.mainWorkspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
    };
    $scope.runCurrent = function() {
      var code;
      code = Blockly.JavaScript.workspaceToCode();
      console.log(code);
      return eval(code);
    };
    $scope.run = function(id) {

      var data = _.where($scope.blocks, {
        id: id
      })[0];
      return eval(data.js);
    };
    return $scope.trigger = function(action) {
      var en;
      en = action;
      if (arguments[1] != null) {
        en = "" + en + ":" + arguments[1];
      }
      console.debug("emit", en);
      return $scope.$emit(en);
    };
});

