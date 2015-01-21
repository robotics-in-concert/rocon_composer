(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/eskim/current/cento_authoring/public/js/prezi/app.js":[function(require,module,exports){

angular.module('prezi-demo', [])
  .config(PreziConfig)
  .controller('PreziDemoController', PreziDemoController);



/* @ngInject */
function PreziConfig($interpolateProvider){
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');

}

/* @ngInject */
function PreziDemoController($scope){


  // sample id : vq59j-nslium
  $scope.prezi = {id: 'vq59j-nslium'};
  $scope.player = null;
  $scope.loadPrezi = function(){
    $scope.player = new PreziPlayer('prezi-div', {
      preziId: $scope.prezi.id,
      // width: 1100,
      width: "100%",
      height: 800
    });

  }
  $scope.preziMove = function(delta){
    if(!$scope.player){
      return;
    }

    if(delta >= 0){
      $scope.player.flyToNextStep();
    }else{
      $scope.player.flyToPreviousStep();
    }

  };

}

},{}]},{},["/Users/eskim/current/cento_authoring/public/js/prezi/app.js"]);
