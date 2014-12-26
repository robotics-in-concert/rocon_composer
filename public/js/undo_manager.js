UNDO_CHECK_INTERVAL = 1000;
UNDO_MAX_SIZE = 100;
var UndoManager = function(){
  this.stack = [];


};

UndoManager.prototype.start = function(){
  // this.timer = setInterval(this.pushSnapshot.bind(this), UNDO_CHECK_INTERVAL);
  Blockly.mainWorkspace.getCanvas().addEventListener('blocklyWorkspaceChange', this.pushSnapshot.bind(this));

};

UndoManager.prototype.stop = function(){
  Blockly.mainWorkspace.getCanvas().removeEventListener('blocklyWorkspaceChange', this.pushSnapshot.bind(this));
  // clearInterval(this.timer);
}

UndoManager.prototype.pushSnapshot = function(){
  if(this.stack.length >= UNDO_MAX_SIZE)
    return;

  var curXml = _xml();

  if(this.stack.length == 0 || curXml != this.stack[this.stack.length-1]){
    console.log('snapshot pushed');
    // console.log('cur: '+curXml+' , was:'+this.stack[this.stack.length-1]);
    this.stack.push(curXml);
    this.stack.slice(0, UNDO_MAX_SIZE);
  }else{
    // console.log('no snapshot pushed - equal');
  }



};

UndoManager.prototype.undo = function(){
  if(this.stack.length < 2)
    return;

  this.stop();
  this.stack.pop(); // pop current
  var dom = Blockly.Xml.textToDom(this.stack.pop())
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);

  this.start();


};




