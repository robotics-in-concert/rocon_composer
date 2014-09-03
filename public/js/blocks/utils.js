
/*
 * Sleep
 */
Blockly.Blocks['json'] = {
  init: function() {
    // this.setColour(ACTION_COLOR);
    this.appendDummyInput()
      .appendField("JSON")
      .appendField(new Blockly.FieldTextInput('{}', null), 'JSON')
    this.setOutput(true, 'Array');
    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  }
};

Blockly.JavaScript['json'] = function(block) {
  var json = block.getFieldValue('JSON');
  var code = _.template("JSON.parse('<%= json%>')")({json: json});


  return [json, Blockly.JavaScript.ORDER_ATOMIC];
};

/*
 * defer
 */
Blockly.Blocks['defer'] = {
  init: function() {
    // this.setColour(ACTION_COLOR);
    this.appendStatementInput('DO')
      .appendField('background')

    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['defer'] = function(block) {
  var code = Blockly.JavaScript.statementToCode(block, 'DO');
  return _.template("setTimeout(function(){Fiber(function(){ <%= code %> }).run();}, 0);")({code: code});
};
