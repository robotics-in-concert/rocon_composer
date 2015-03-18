
Blockly.Blocks['ui_horizontal'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Layout(horizontal)' + name);
    this.setInputsInline(true);

    this.appendStatementInput('components')
      .appendField("components")

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

};

Blockly.Blocks['ui_vertical'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Layout(vertical)' + name);
    this.setInputsInline(true);

    this.appendStatementInput('components')
      .appendField("components")

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

};

Blockly.Blocks['ui_button'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Button' + name);

    this.appendValueInput('NAME').appendField('name : ');
    this.appendValueInput('TEXT').appendField('text : ');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);


  },

};

