var $ = require('jquery'),
  Utils = require('../utils')

module.exports = function($scope, blocksStore, $http, serviceAuthoring, $stateParams, $state) {
  console.log('x');
  $scope.current = {interfaces: []};

 $scope.addItem = function(lst, item){
   console.log(lst);
   lst.push(item);
 }
 $scope.deleteItem = function(lst, item){
   console.log(lst, item);

   _.pull(lst, item);
 }

};
