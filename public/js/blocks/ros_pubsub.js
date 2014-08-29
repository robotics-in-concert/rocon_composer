
Blockly.Blocks['ros_subscribe'] = {
  init: function() {
    this.setColour(10);
    this.appendDummyInput()
      .appendField('[ROS] subscribe')
      .appendField(new Blockly.FieldTextInput('name', null), 'EVENT');

    this.appendStatementInput('DO')
      .appendField('do')
      .appendField(new Blockly.FieldVariable('item'), 'DO_PARAM');

    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  },

  getVars: function(){
    return [this.getFieldValue('DO_PARAM')];
  }
};

Blockly.JavaScript['ros_subscribe'] = function(block) {
  var event = block.getFieldValue('EVENT');
  var param0 = block.getFieldValue('DO_PARAM');
  var code = Blockly.JavaScript.statementToCode(block, 'DO');
  var tpl = "$engine.subscribe('<%= event %>'); $engine.ee.on('<%= event %>', function(<%= param0 %>){ <%= code %> })";

  return _.template(tpl)({event: event, code: code, param0: param0});
};

Blockly.Blocks['ros_publish'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE')
      .appendField("[ROS] publish")
      .appendField(new Blockly.FieldTextInput('name', null), 'NAME')
      .appendField(new Blockly.FieldTextInput('type', null), 'TYPE')
      .appendField("message :").setAlign(Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['ros_publish'] = function(block) {
  var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = block.getFieldValue('NAME');
  var type = block.getFieldValue('TYPE');

  var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>)';

  return _.template(tpl)({name: name, type: type, msg: msg});
};
