var $ = require('jquery'),
  Utils = require('../utils')

module.exports = function($scope, blocksStore, $http, serviceAuthoring, $stateParams, $state) {
  console.log('x');
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

};
