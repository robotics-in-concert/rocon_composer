
Blockly.Blocks['ros_requester_allocate'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("Allocate Resource");
    this.appendDummyInput().appendField('type').appendField(new Blockly.FieldDropdown([['dynamic', 'dynamic'], ['static', 'static']]), 'TYPE');
    this.appendDummyInput().appendField('var').appendField(new Blockly.FieldTextInput('resource', null), 'VAR')
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // this.setOutput(true);
    return this;
  },

  getVars: function(){
    return [this.getFieldValue('VAR')];

  }
  
};
Blockly.JavaScript['ros_requester_allocate'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;
  var type = block.getFieldValue('TYPE');


  var tpl = 'var <%= var_name %> = ($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= options %>)); ';

  var code = _.template(tpl)({
    var_name: this.getFieldValue('VAR'),
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: JSON.stringify(config.remappings),
    parameters: JSON.stringify(config.parameters),
    options: JSON.stringify({timeout: config.timeout, type: type})
  });
  console.log(code);

  return code;

};




Blockly.Blocks['ros_requester_release'] = {
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendValueInput('CTX').appendField("Release Resource");
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['ros_requester_release'] = function(block){
  var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";
  var tpl = '$engine.releaseResource(<%= ctx %>);';
  return _.template(tpl)({ctx: ctx});

};


