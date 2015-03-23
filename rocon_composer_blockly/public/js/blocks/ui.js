
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
Blockly.Blocks['ui_text'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Text' + name);

    this.appendDummyInput().appendField('name:')
      .appendField(new Blockly.FieldTextInput('name', null), 'NAME');

    this.appendValueInput('TEXT').appendField('text:');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);

  },

};

Blockly.Blocks['ui_button'] = {

  init: function() {
    this.setColour(30);
    this.appendDummyInput().appendField('Button' + name);

    this.appendDummyInput().appendField('name:')
      .appendField(new Blockly.FieldTextInput('name', null), 'NAME');

    this.appendValueInput('TEXT').appendField('text:');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);


  },

};
Blockly.JavaScript['ui_button'] = function(block){
  var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = block.getFieldValue('NAME');

  console.log(name);

  var code = _.template('layout.push({type: "button", name: "<%= name %>", text: <%= text %>});')({
    text: text,
    name: name
  });
  return code;
};
Blockly.JavaScript['ui_text'] = function(block){
  var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = block.getFieldValue('NAME');

  console.log(name);

  var code = _.template('layout.push({type: "text", name: "<%= name %>", text: <%= text %>});')({
    text: text,
    name: name
  });
  return code;
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

