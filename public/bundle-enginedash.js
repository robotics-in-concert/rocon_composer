(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/eskim/current/cento_authoring/public/js/engine/app.js":[function(require,module,exports){
angular.module('engine-dashboard', [
  'btford.socket-io'
])
  .config(Config)
  .factory('socket', ['socketFactory', function(socketFactory){
    var host = location.host;
    var sock_port = SOCKETIO_PORT;
    
    if(host.match(/:\d+/)){
      host = host.replace(location.port, sock_port);
    }else{
      host = host + ":" + sock_port;
    }
    var url = location.protocol + '//' + host + "/engine";
    console.log('socket host', url);

    var myIoSocket = io.connect(url);

    var sock = socketFactory({
      ioSocket: myIoSocket,
      prefix: 'engine:'
    });
    sock.forward('error');
    return sock;
  }])
  .controller('engineDashboardController', EngineDashboardController);



/* @ngInject */
function Config($interpolateProvider){
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');

}

/* @ngInject */
function EngineDashboardController($scope, socket, $location){
  $scope.foo = 'bar';


  $scope.published = [];

  socket.on('publish', function(data){
    console.log('1');

    console.log(data);
    $scope.published.push(data)

  });

}

},{}]},{},["/Users/eskim/current/cento_authoring/public/js/engine/app.js"]);
