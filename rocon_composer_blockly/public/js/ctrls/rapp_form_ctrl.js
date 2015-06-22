var $ = require('jquery'),
  Utils = require('../utils'),
  PackageSelectCtrl = require('./modal/package_select_ctrl');

module.exports = function($scope, blocksStore, $http, serviceAuthoring, $stateParams, $state, $modal) {
  console.log('x');
  $scope.current = {
    public_interface: {
      'subscribers':[],
      'publishers':[],
      'services':[],
      'action_clients':[],
      'action_servers':[]
    },
    public_parameter: []
  };



  if($stateParams.rapp_id){
    blocksStore.getParam(RAPPS_PARAM_KEY).then(function(rows){
      $scope.current = _.find(rows, {id: $stateParams.rapp_id});
    });



  }

  $scope.save = function(){
    blocksStore.getParam(RAPPS_PARAM_KEY).then(function(rows){
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



      blocksStore.setParam(RAPPS_PARAM_KEY, rows).then(function(res){
        alert('saved');
        $state.go('rapps_edit', {rapp_id: v.id});

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
   var mi = $modal.open({
     templateUrl: '/js/tpl/modal/package_select.html',
     controller: PackageSelectCtrl,
     controllerAs: 'ctrl',
     resolve: {
       packages: function(){ 
         return $http.get('/api/rapp/packages').then(function(res){
           return res.data;
         });
       },
       defaults: function(){ return {
         title: $scope.current.name,
         description: $scope.current.description
       }; }
     }

   });

   mi.result.then(function(selected){
     var pack = selected.package;
     var v = _.clone($scope.current);
     selected.rapp = v;



     $http.post('/api/rapp/save', selected).then(function(res){
       console.log('rapp saved');

     });

   });

 };
};
