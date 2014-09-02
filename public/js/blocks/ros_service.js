Blockly.Blocks['ros_service'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE')
      .appendField("[ROS] call service")
      .appendField(new Blockly.FieldTextInput('name', null), 'NAME')
      .appendField(new Blockly.FieldTextInput('type', null), 'TYPE')
      .appendField("message :").setAlign(Blockly.ALIGN_RIGHT);
    this.setOutput(true);
  }
};

Blockly.JavaScript['ros_service'] = function(block) {
  var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = block.getFieldValue('NAME');
  var type = block.getFieldValue('TYPE');

  var tpl = '($engine.runService("<%= name %>", "<%= type %>", <%= msg %>))';
  var code =_.template(tpl)({name: name, type: type, msg: msg});
  return [code, Blockly.JavaScript.ORDER_NONE];
};
