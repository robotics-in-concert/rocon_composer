
Blockly.register_scheduled_publish_block = function(rapp, uri, name, type){
  Blockly.Blocks['ros_scheduled_publish_'+name] = {
    configable: true,

    init: function() {
      this.setColour(ACTION_COLOR);
      this.appendValueInput('VALUE').appendField('[Publish] ' + name);
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    }
  };

  Blockly.JavaScript['ros_scheduled_publish_'+name] = function(block) {
    var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = '$engine.scheduledPublish("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, "<%= name %>", "<%= type %>", <%= msg %>);';
    var remappings = [];
    if(block.extra_config){
      remappings = block.extra_config.remappings;
      remapped_name = R.find(R.propEq('remap_from', name))(remappings).remap_to;
    };
    var parameters = [];
    return _.template(tpl)({rapp: rapp, uri:uri, 
                           remappings: JSON.stringify(remappings), 
                           parameters: JSON.stringify(parameters), 
                           name: remapped_name, type: type, msg: msg});
  };
};


Blockly.register_publish_block = function(name, type){
  
  Blockly.Blocks['ros_publish_'+name] = {
    init: function() {
      this.setColour(ACTION_COLOR);
      this.appendValueInput('VALUE').appendField('[Publish] ' + name);
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    }
  };

  Blockly.JavaScript['ros_publish_'+name] = function(block) {
    var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>);';
    return _.template(tpl)({name: name, type: type, msg: msg});
  };

};


Blockly.register_scheduled_subscribe_block = function(rapp, uri, name, type, extra){

  Blockly.JavaScript['ros_scheduled_subscribe_'+name] = function(block) {
    var param0 = block.getFieldValue('DO_PARAM');
    var code = Blockly.JavaScript.statementToCode(block, 'DO');
    var tpl = "$engine.scheduledSubscribe('<%= rapp %>', '<%= uri %>', <%= remappings %>, <%= parameters %>, '<%= name %>', '<%= type %>'); $engine.ee.on('<%= name %>', function(<%= param0 %>, requester){ <%= code %> });";
    var remappings = [];
    if(block.extra_config){
      remappings = block.extra_config.remappings;
      remapped_name = R.find(R.propEq('remap_from', name))(remappings).remap_to;
      
    };
    var parameters = [];
    return _.template(tpl)({rapp: rapp, uri:uri, 
                           remappings: JSON.stringify(remappings), 
                           parameters: JSON.stringify(parameters), 
                           name: remapped_name, type: type, code: code, param0: param0});

  };


  Blockly.Blocks['ros_scheduled_subscribe_'+name] = {
    configable: true,

    init: function() {
      this.extra = extra;
      this.setColour(10);
      this.appendDummyInput().appendField('[ROS] subscribe ' + name);
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
Blockly.register_subscribe_block = function(name, type, extra){

  Blockly.JavaScript['ros_subscribe_'+name] = function(block) {
    var param0 = block.getFieldValue('DO_PARAM');
    var code = Blockly.JavaScript.statementToCode(block, 'DO');
    var tpl = "$engine.subscribe('<%= name %>', '<%= type %>'); $engine.ee.on('<%= name %>', function(<%= param0 %>){ <%= code %> });";

    return _.template(tpl)({name: name, code: code, param0: param0, type: type});
  };


  Blockly.Blocks['ros_subscribe_'+name] = {
    init: function() {
      this.extra = extra;
      this.setColour(10);
      this.appendDummyInput().appendField('[ROS] subscribe ' + name);
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

Blockly.Blocks['ros_subscribe'] = {
  init: function() {
    this.setColour(10);
    this.appendValueInput('NAME').appendField('[ROS] subscribe name :');
    this.appendValueInput('TYPE').appendField('type :');
    this.setInputsInline(true);

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
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";
  var param0 = block.getFieldValue('DO_PARAM');
  var code = Blockly.JavaScript.statementToCode(block, 'DO');
  var tpl = "$engine.subscribe(<%= name %>, <%= type %>); $engine.ee.on(<%= name %>, function(<%= param0 %>){ <%= code %> });";

  return _.template(tpl)({name: name, code: code, param0: param0, type: type});
};

Blockly.Blocks['ros_publish'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('NAME').appendField('[ROS] publish name :');
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
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE').appendField('xxxxxxxxxxxxx xx xoijqweofij qwoefij ');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

