var Blockly = require('blockly');
var ACTION_COLOR = require('../config').action_color;

Blockly.Blocks['ros_service'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('NAME').appendField('[ROS] call service :');
    this.appendValueInput('TYPE').appendField('type :');
    this.appendValueInput('VALUE').appendField('message :');

    this.setInputsInline(true);
    this.setOutput(true);
  }
};

Blockly.JavaScript['ros_service'] = function(block) {
  var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";

  var tpl = '($engine.runService(<%= name %>, <%= type %>, <%= msg %>))';
  var code =_.template(tpl)({name: name, type: type, msg: msg});
  return [code, Blockly.JavaScript.ORDER_NONE];
};


