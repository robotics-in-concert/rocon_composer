var player = new PreziPlayer('prezi-div', {
  preziId: 'vq59j-nslium', 
  width: 1100,
  height: 800
});


$(function(){
  $('.next').click(function(){
    player.flyToNextStep();
    return false;

  });
  $('.prev').click(function(){
    player.flyToPreviousStep();
    return false;

  });

});


var socket = io();
socket.on('connect', function(){
  console.log('connected');

  socket.on('message', function(msg){
    var act = msg.action;
    if(act == 'prezi-next'){
      player.flyToNextStep();

    }else if(act == 'prezi-prev'){
      player.flyToPreviousStep();

    }
    console.log(msg);
  });
});
