var _ = require('lodash');

// @ngInject
function PackageSelectCtrl($scope, $rootScope, $modalInstance, packages, defaults) {

  console.log("PACKAGES", packages);
  console.log("DEF", defaults);


  var ctrl = this;
  ctrl.current = _.defaults({}, defaults);
  ctrl.packages = packages;
  // ctrl.items = items;
  // ctrl.selected = null;

  // this.ok = function(){
    // $modalInstance.close(ctrl.selected);
  // };


};

module.exports = PackageSelectCtrl;
