var app = angular.module('centoAuthoring', []);

ITEMS_PARAM_KEY = 'cento_authoring_items';

app.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

app.service('blocksStore', function($http){


  this.setParam = function(k, v){
    return $http.post('/api/param/'+k, {data: v}).then(function(res){
      return res.data;
    });
  }
  this.publish = function(topic){
    return $http.post('/api/publish/'+topic).then(function(res){
      return res.data;
    });
  }
  this.getParam = function(k){
    return $http.get('/api/param/'+k).then(function(res){
      if(res.data.data){
        return res.data.data;
      }
      return null;
    });
  }
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


    $scope.triggerEvent = function(topic) {
      blocksStore.publish(topic).then(function(){
        alert('ok');

      });
    };
    $scope.deleteItem = function(id) {
      $scope.items = _.reject($scope.items, {id: id})
      $scope.current = null;
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

