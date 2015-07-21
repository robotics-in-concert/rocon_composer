var _ = require('lodash');
var Blockly = require('blockly');
var ACTION_COLOR = require('../config').action_color;

Blockly.register_scheduled_publish_block = function(rapp, uri, name, type){
  Blockly.Blocks['ros_scheduled_publish_'+name] = {

    init: function() {
      this.setColour(BLOCK_COLOR.ros_pub);
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage('/img/icon/PUB.png', 60, 15, '*'))
        .appendField(name);
      this.appendValueInput('CTX').appendField('context : ');
      this.appendValueInput('VALUE').appendField('value : ');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    }
  };

  Blockly.JavaScript['ros_scheduled_publish_'+name] = function(block) {
    var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = '$engine.scheduledPublish(<%= ctx %>, "<%= name %>", "<%= type %>", <%= msg %>);';
    return _.template(tpl)({name: name, type: type, msg: msg, ctx: ctx});
  };
};


Blockly.register_publish_block = function(key, name, type, extra){
  
  Blockly.Blocks['ros_publish_'+key] = {
    init: function() {
      this.extra = extra;
      this.setColour(BLOCK_COLOR.ros_pub);
      this.appendValueInput('VALUE')
        .appendField(new Blockly.FieldImage('/img/icon/PUB.png', 60, 15, '*'))
        .appendField(name);
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      if(extra && extra.tooltip){
        this.setTooltip(extra.tooltip);
      }
      return this.setNextStatement(true);
    }
  };

  Blockly.JavaScript['ros_publish_'+key] = function(block) {
    var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = '$engine.pub("{{<%= key %>}}", "<%= type %>", <%= msg %>);';
    return _.template(tpl)({key: key, name: name, type: type, msg: msg});
  };

};


Blockly.register_scheduled_subscribe_block = function(rapp, uri, name, type, extra){

  Blockly.JavaScript['ros_scheduled_subscribe_'+name] = function(block) {
    var param0 = block.getFieldValue('DO_PARAM');
    var code = Blockly.JavaScript.statementToCode(block, 'DO');
    var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = "$engine.scheduledSubscribe(<%= ctx %>, '<%= name %>', '<%= type %>', function(<%= param0 %>){ <%= code %> });";
    return _.template(tpl)({ctx: ctx, name: name, type: type, code: code, param0: param0});

  };


  Blockly.Blocks['ros_scheduled_subscribe_'+name] = {

    init: function() {
      this.extra = extra;
      this.setColour(BLOCK_COLOR.ros_sub);
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage('/img/icon/SUB.png', 60, 15, '*'))
        .appendField(name);
      this.appendValueInput('CTX').appendField('context : ');
      this.setInputsInline(true);

      this.appendStatementInput('DO')
        .appendField('do')
        .appendField(new Blockly.FieldVariable('item'), 'DO_PARAM');

      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    },

    getVars: function(){
      return [this.getFieldValue('DO_PARAM')];
    },
  };
};
Blockly.register_subscribe_block = function(key, name, type, extra){

  Blockly.JavaScript['ros_subscribe_'+key] = function(block) {
    var param0 = block.getFieldValue('DO_PARAM');
    var code = Blockly.JavaScript.statementToCode(block, 'DO');
    var tpl = "$engine.subscribe('{{<%= key %>}}', '<%= type %>', function(<%= param0 %>){ <%= code %> });";

    return _.template(tpl)({key: key, name: name, code: code, param0: param0, type: type});
  };


  Blockly.Blocks['ros_subscribe_'+key] = {
    init: function() {
      this.extra = extra;
      this.setColour(BLOCK_COLOR.ros_sub);
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage('/img/icon/SUB.png', 60, 15, '*'))
        .appendField(name);
      this.setInputsInline(true);

      this.appendStatementInput('DO')
        .appendField('do')
        .appendField(new Blockly.FieldVariable('item'), 'DO_PARAM');

      this.setPreviousStatement(true);
      if(extra && extra.tooltip){
        this.setTooltip(extra.tooltip);
      }
      return this.setNextStatement(true);
    },

    getVars: function(){
      return [this.getFieldValue('DO_PARAM')];
    },
  };
};

Blockly.Blocks['ros_subscribe'] = {
  init: function() {
    this.setColour(BLOCK_COLOR.ros_sub);
    this.appendValueInput('NAME')
      .appendField(new Blockly.FieldImage('/img/icon/SUB.png', 60, 15, '*'))
    this.appendValueInput('TYPE').appendField('type :');
    this.setInputsInline(true);

    this.appendStatementInput('DO')
      .appendField('do')
      .appendField(new Blockly.FieldVariable('item'), 'DO_PARAM');

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

  getVars: function(){
    return [this.getFieldValue('DO_PARAM')];
  }
};


Blockly.JavaScript['ros_subscribe'] = function(block) {
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";
  var param0 = block.getFieldValue('DO_PARAM');
  var code = Blockly.JavaScript.statementToCode(block, 'DO');
  var tpl = "$engine.subscribe(<%= name %>, <%= type %>, function(<%= param0 %>){ <%= code %> });";

  return _.template(tpl)({name: name, code: code, param0: param0, type: type});
};

Blockly.Blocks['ros_publish'] = {
  init: function() {
    this.setColour(BLOCK_COLOR.ros_pub);
    this.appendValueInput('NAME')
      .appendField(new Blockly.FieldImage('/img/icon/PUB.png', 60, 15, '*'))
    this.appendValueInput('TYPE').appendField('type :');
    this.appendValueInput('VALUE').appendField('message :');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['ros_publish'] = function(block) {
  var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";

  var tpl = '$engine.pub(<%= name %>, <%= type %>, <%= msg %>);';

  return _.template(tpl)({name: name, type: type, msg: msg});
};

Blockly.Blocks['ros_publish2'] = {
  init: function() {
    this.setColour(BLOCK_COLOR.ros_pub);
    this.appendValueInput('VALUE').appendField('xxxxxxxxxxxxx xx xoijqweofij qwoefij ');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

