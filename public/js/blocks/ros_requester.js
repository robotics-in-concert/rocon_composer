
Blockly.Blocks['ros_requester_allocate'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("Allocate Resource");
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutput(true);
    return this;
  }
};
Blockly.JavaScript['ros_requester_allocate'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;


  var tpl = '($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>)) ';

  var code = _.template(tpl)({
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: JSON.stringify(config.remappings),
    parameters: JSON.stringify(config.parameters)
  });
  return [code, Blockly.JavaScript.ORDER_ATOMIC];

};




Blockly.Blocks['ros_requester_release'] = {
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendValueInput('CTX').appendField("Release Resource");
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['ros_requester_release'] = function(block){
  var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";
  var tpl = '$engine.releaseResource(<%= ctx %>);';
  return _.template(tpl)({ctx: ctx});

};


