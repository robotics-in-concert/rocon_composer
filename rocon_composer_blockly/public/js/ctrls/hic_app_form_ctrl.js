
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
