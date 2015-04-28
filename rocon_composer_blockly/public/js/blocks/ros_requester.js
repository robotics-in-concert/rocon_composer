var _ = require('lodash');
var Blockly = require('blockly');

Blockly.Blocks['ros_requester_allocate'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(BLOCK_COLOR.ros);
    this.appendDummyInput().appendField("Allocate Resource");
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutput(true);
    return this;
  }
};
Blockly.JavaScript['ros_requester_allocate'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;


  var tpl = '($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= options %>)) ';

  var code = _.template(tpl)({
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: JSON.stringify(config.remappings),
    parameters: JSON.stringify(config.parameters),
    options: JSON.stringify({timeout: config.timeout})
  });
  return [code, Blockly.JavaScript.ORDER_ATOMIC];

};


Blockly.Blocks['ros_requester_allocate2'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(BLOCK_COLOR.ros);
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
Blockly.JavaScript['ros_requester_allocate2'] = function(block){
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

Blockly.Blocks['ros_requester_allocate_with_block'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(BLOCK_COLOR.ros);
    this.appendDummyInput().appendField("Allocate Resource");
    this.appendDummyInput().appendField('type').appendField(new Blockly.FieldDropdown([['dynamic', 'dynamic'], ['static', 'static']]), 'TYPE');
      this.appendStatementInput('ON_SUCCESS')
        .appendField("Success")
        .appendField(new Blockly.FieldVariable('resource'), 'ON_SUCCESS_PARAM');

      this.appendStatementInput('ON_FAIL')
        .appendField("Fail")
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // this.setOutput(true);
    return this;
  },

  getVars: function(){
    return [this.getFieldValue('ON_SUCCESS_PARAM')];

  }
  
};
Blockly.JavaScript['ros_requester_allocate_with_block'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;
  var type = block.getFieldValue('TYPE');

  var codeSuccess = Blockly.JavaScript.statementToCode(block, 'ON_SUCCESS');
  var codeFail = Blockly.JavaScript.statementToCode(block, 'ON_FAIL');
  var paramNameOnSucess = block.getFieldValue('ON_SUCCESS_PARAM');

  var tpl = '(function(<%= param %>){ if(<%= param %>){ <%= codeSuccess %> }else{ <%= codeFail %>} })($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= options %>));';

  var code = _.template(tpl)({
    var_name: this.getFieldValue('VAR'),
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: angular.toJson(config.remappings),
    parameters: angular.toJson(config.parameters),
    options: angular.toJson({timeout: config.timeout, type: type}),
    param: paramNameOnSucess,
    codeSuccess: codeSuccess,
    codeFail: codeFail
  });
  console.log(code);

  return code;

};

Blockly.Blocks['ros_requester_allocate_with_block2'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(BLOCK_COLOR.ros);
    this.appendDummyInput().appendField("Allocate Resource");
    this.appendDummyInput().appendField('type').appendField(new Blockly.FieldDropdown([['dynamic', 'dynamic'], ['static', 'static']]), 'TYPE');
    this.appendValueInput('TIMEOUT_ALLOC').appendField('timeout');
    this.appendStatementInput('ON_SUCCESS')
      .appendField("Success")
      .appendField(new Blockly.FieldVariable('resource'), 'ON_SUCCESS_PARAM');

    this.appendStatementInput('ON_FAIL')
      .appendField("Fail")
    this.setInputsInline(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // this.setOutput(true);
    return this;
  },

  getVars: function(){
    return [this.getFieldValue('ON_SUCCESS_PARAM')];

  }
  
};
Blockly.JavaScript['ros_requester_allocate_with_block2'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;
  var type = block.getFieldValue('TYPE');

  var timeout_alloc = +Blockly.JavaScript.valueToCode(block, 'TIMEOUT_ALLOC', Blockly.JavaScript.ORDER_ATOMIC) || -1;


  console.log(timeout_alloc);
  console.log({type: type, timeout_run: timeout_run, timeout_alloc: timeout_alloc });



  var codeSuccess = Blockly.JavaScript.statementToCode(block, 'ON_SUCCESS');
  var codeFail = Blockly.JavaScript.statementToCode(block, 'ON_FAIL');
  var paramNameOnSucess = block.getFieldValue('ON_SUCCESS_PARAM');


  var tpl = '(function(<%= param %>){ if(<%= param %>){ <%= codeSuccess %> }else{ <%= codeFail %>} })'+
    '($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= options %>));';

  var code = _.template(tpl)({
    var_name: this.getFieldValue('VAR'),
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: angular.toJson(config.remappings),
    parameters: angular.toJson(config.parameters),
    options: angular.toJson({type: type, timeout: timeout_alloc}),
    param: paramNameOnSucess,
    codeSuccess: codeSuccess,
    codeFail: codeFail
  });
  console.log(code);

  return code;

};



Blockly.Blocks['ros_requester_release'] = {
  init: function() {
    var block = this;
    this.setColour(BLOCK_COLOR.ros);
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


