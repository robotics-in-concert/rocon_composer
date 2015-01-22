
angular.module('prezi-demo', [
  'btford.socket-io'
])
  .config(PreziConfig)
  .factory('preziSocket', ['socketFactory', function(socketFactory){
    var sock = socketFactory({prefix: 'prezi:'});
    sock.forward('error');
    return sock;
  }])
  .controller('PreziDemoController', PreziDemoController);



/* @ngInject */
function PreziConfig($interpolateProvider){
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');

}

/* @ngInject */
function PreziDemoController($scope, preziSocket){


  // sample id : vq59j-nslium
  $scope.prezi = {id: '32iuijp9zylz'};
  $scope.player = null;
  $scope.loadPrezi = function(){
    if($scope.preziForm.$invalid)
      return;

    $scope.player = new PreziPlayer('prezi-div', {
      preziId: $scope.prezi.id,
      // width: 1100,
      width: "100%",
      height: 800,
      controls: true
    });
    console.log($scope.player);
    preziSocket.on(['prezi', $scope.prezi.channel, 'next'].join(':'), function(){
      $scope.player.flyToNextStep();
    });
    preziSocket.on(['prezi', $scope.prezi.channel, 'move'].join(':'), function(opt){
      console.log('MOVE', opt);
      var step = opt.step;
      $scope.player.flyToStep(step);
    });
    preziSocket.on(['prezi', $scope.prezi.channel, 'prev'].join(':'), function(){
      $scope.player.flyToPreviousStep();
    });





  }
  $scope.enterFullScreen = function(){
    // var div = $('#prezi-div iframe').get(0);
    // $('#prezi-div iframe').on('webkitfullscreenchange', function(){
      // $scope.player.setDimensions({height: '100%', width: '100%'})
      // $scope.player.flyToStep($scope.player.getCurrentStep());

    // });
    // div.webkitRequestFullscreen();
  };
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
