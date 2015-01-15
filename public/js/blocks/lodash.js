var _ = require('lodash');
var Blockly = require('blockly');

Blockly.Blocks['lodash_find'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('find first item in array')
      .appendField(new Blockly.FieldVariable('item', null), 'VAR')
    this.appendDummyInput().appendField('where').appendField(new Blockly.FieldTextInput('key', null), 'KEY');
    this.appendValueInput('VAL').appendField('is');
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};


Blockly.JavaScript['lodash_find'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var arr = block.getFieldValue('VAR');
  var key = block.getFieldValue('KEY');
  var val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_NONE) || "''";

  
  // var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  // var code = key + ":" + value;
  //
  var code = _.template("_.find(<%= arr%>, function(i){ return i['<%= key%>'] === <%= val %>; })", {arr: arr, key: key, val: val})

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

};


// Blockly.JavaScript['object_item'] = function(block){

  // // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  // var key = block.getFieldValue('KEY');
  // var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  // var code = key + ":" + value;

  // return [code, Blockly.JavaScript.ORDER_ATOMIC];

// }
