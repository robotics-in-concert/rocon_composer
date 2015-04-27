var Blockly = require('blockly');
var _ = require('lodash');
var ACTION_COLOR = require('../config').action_color;

Blockly.Blocks['ros_parameter'] = {
  init: function() {
    this.setColour(BLOCK_COLOR.ros);
    this.appendDummyInput().appendField('Parameter').appendField(new Blockly.FieldTextInput('key', null), 'KEY')
    this.setInputsInline(true);
    this.setOutput(true);
  }
};

Blockly.JavaScript['ros_parameter'] = function(block) {
  var key = this.getFieldValue('KEY');

  var tpl = '({{parameter:<%= key %>}})';
  var code =_.template(tpl)({key: key});
  return [code, Blockly.JavaScript.ORDER_NONE];
};


