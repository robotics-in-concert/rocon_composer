
Blockly.Blocks['ui_create'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Create UI');
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('name', null), 'NAME')
    this.setInputsInline(true);

    this.appendStatementInput('COMPS')
      .appendField("components")

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

};


Blockly.Blocks['ui_horizontal'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Layout(horizontal)' + name);
    this.setInputsInline(true);

    this.appendStatementInput('COMPS')
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

    this.appendStatementInput('COMPS')
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
Blockly.JavaScript['ui_button'] = function(block){
  return 'layout.push({type: "button"});';
};


var _componentsMeta = function(block){
  var code = Blockly.JavaScript.statementToCode(block, 'COMPS', Blockly.JavaScript.ORDER_NONE) || "''";
  var meta_tpl = _.template('(function(layout){ <%= code %>; return layout; })([]);');
  var meta = meta_tpl({code: code});
  return JSON.stringify(eval(meta));

};

Blockly.JavaScript['ui_vertical'] = function(block){
  return _.template('layout.push({type: "vertical", children: <%= meta %>});')({meta: _componentsMeta(block)});
};
Blockly.JavaScript['ui_horizontal'] = function(block){
  return _.template('layout.push({type: "horizontal", children: <%= meta %>});')({meta: _componentsMeta(block)});
};
Blockly.JavaScript['ui_create'] = function(block){
  var name = block.getFieldValue('NAME');
  var tpl = _.template("$engine.createUI('<%= name%>', <%= meta %>);");
  return tpl({name: name, meta: _componentsMeta(block)});
};

