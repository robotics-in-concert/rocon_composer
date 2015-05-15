
var $ = require('jquery'),
  Utils = require('../utils')

module.exports = function($scope, blocksStore, $http, serviceAuthoring, $stateParams, $state) {
  $scope.current = {interfaces: {
    'subscribers':[],
    'publishers':[],
    'services':[],
    'action_clients':[],
    'action_servers':[]
  }
  };


  if($stateParams.hic_app_id){
    blocksStore.getParam(HIC_APPS_PARAM_KEY).then(function(rows){
      $scope.current = _.find(rows, {id: $stateParams.hic_app_id});
    });



  }


$scope.save = function(){
  blocksStore.getParam(HIC_APPS_PARAM_KEY).then(function(rows){
    if(_.isEmpty(rows)){
      rows = []
    }

    var v = $scope.current;

    if(v.id){
      var s = _.find(rows, {id: v.id});
      _.assign(s, v);

    }else{
      v.id = Utils.uuid();
      v.created_at = new Date().getTime();
      rows.push(v);


    }
    console.log(v.id);



    blocksStore.setParam(HIC_APPS_PARAM_KEY, rows).then(function(res){
      alert('saved');
      $state.go('hic_apps_edit', {hic_app_id: v.id});

    });

  });



};

 $scope.addItem = function(lst, item){
   console.log(lst);
   lst.push(item);
 }
 $scope.deleteItem = function(lst, item){
   console.log(lst, item);

   _.pull(lst, item);
 }
 $scope.export = function(){
   var cur = $scope.current;
   $http.post('/api/hic_app/save', {data: cur, title: cur.defaults.display, description: cur.defaults.description})
    .then(function(){
      alert('exported');

    });

 };


};
