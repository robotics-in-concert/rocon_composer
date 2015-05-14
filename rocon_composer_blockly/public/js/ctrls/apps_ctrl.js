

module.exports = function($scope, blocksStore, $http, serviceAuthoring, $stateParams, $state, $modal) {

  blocksStore.getParam(RAPPS_PARAM_KEY).then(function(rows){
    $scope.rapps = rows;
  });
  blocksStore.getParam(HIC_APPS_PARAM_KEY).then(function(rows){
    $scope.hic_apps = rows;
  });

};
