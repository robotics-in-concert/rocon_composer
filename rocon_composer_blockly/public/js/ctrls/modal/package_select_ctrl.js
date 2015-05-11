
// @ngInject
function PackageSelectCtrl($scope, $rootScope, $modalInstance, packages) {

  console.log("PACKAGES", packages);

  var ctrl = this;
  ctrl.current = {};
  ctrl.packages = packages;
  // ctrl.items = items;
  // ctrl.selected = null;

  // this.ok = function(){
    // $modalInstance.close(ctrl.selected);
  // };


};

module.exports = PackageSelectCtrl;
