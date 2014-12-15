
Blockly.Blocks['ros_requester_allocate'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("Allocate Resource");
    this.appendStatementInput('DO')
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['ros_requester_allocate'] = function(block){
  return "requester.cancel_all();";

};




Blockly.Blocks['ros_requester_release'] = {
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("release resources");
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['ros_requester_release'] = function(block){
  return "requester.cancel_all();";

};


