
var _ = require('lodash');
var Blockly = require('blockly');

Blockly.Blocks['prezi_prev'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('prezi - prev')
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};
Blockly.Blocks['prezi_next'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('prezi - next')
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};


Blockly.JavaScript['prezi_next'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var data = {action: 'prezi-next'};
  var code = _.template("$engine.socketBroadcast(<%= data %>);")({data: JSON.stringify(data)});
  return code;

};
Blockly.JavaScript['prezi_prev'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var data = {action: 'prezi-prev'};
  var code = _.template("$engine.socketBroadcast(<%= data %>);")({data: JSON.stringify(data)});
  return code;

};


