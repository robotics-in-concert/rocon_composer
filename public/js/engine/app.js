angular.module('engine-dashboard', [
  'btford.socket-io'
])
  .config(Config)
  .factory('socket', ['socketFactory', function(socketFactory){
    // var myIoSocket = io.connect('localhost:9999/engine');
    var myIoSocket = io(location.host + '/engine');
    myIoSocket.on('connect', function(){
      console.log('connect@!!!!!');


    });

    var sock = socketFactory({
      ioSocket: myIoSocket
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
  console.log(socket);
  socket.emit('xx');

  $scope.foo = 'bar';


  $scope.published = [];

  socket.on('data', function(data){
    console.log(data);


  });
  socket.on('publish', function(data){
    console.log('1');

    console.log(data);
    $scope.published.push(data)

  });

}
