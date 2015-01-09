module.exports = function(io){
  var first = true;
  io.on('connection', function(socket){
    console.log('socket connected');
    if(first){
      socket.first = true;
      first = false;
      socket.emit('blockly:workspace:first');
    }


    socket.on('disconnect', function(){
      if(socket.first){
        first = true;
      }
    });
    socket.on('blockly:workspace:changed', function(e){
      if(socket.first)
        socket.broadcast.emit('blockly:workspace:changed', e);
    });



  });

};
