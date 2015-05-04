var _ = require('lodash');
var Blockly = require('blockly');

Blockly.register_scheduled_action_block = function(rapp, uri, name, type){
  Blockly.JavaScript['ros_scheduled_action_t_' + name] = function(block){
    var extraConfig = block.extra_config;

    // var name = block.getFieldValue('NAME');
    // var type = block.getFieldValue('TYPE');

    var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
    var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
    var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
    var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');
    var codeOnTimeout = Blockly.JavaScript.statementToCode(block, 'ON_TIMEOUT');

    var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";
    var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";

    var timeout = +(Blockly.JavaScript.valueToCode(block, 'TIMEOUT', Blockly.JavaScript.ORDER_NONE) || "-1");


    // var remappings = R.pipe(
        // R.map(function(v, k){ return {remap_from: k, remap_to: v}; }),
        // R.values
    // )(extraConfig.remappings);


    var tpl = '$engine.runScheduledAction(<%= ctx %>, "<%= name %>", "<%= type %>", <%= goal %>, ';
    tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>}, function(){<%= codeTimeout %>}, <%= options %>);';

    var code = _.template(tpl)({
      rapp: rapp,
      uri: uri,
      name: name,
      type: type,
      goal: goal, 
      ctx: ctx, 
      param1: paramNameOnResult,
      param2: paramNameOnFeedback,
      code1: codeOnResult, code2: codeOnFeedback,
      codeTimeout: codeOnTimeout,
      options: JSON.stringify({timeout: timeout})
    });
    return code;


  }

  Blockly.Blocks['ros_scheduled_action_t_'+name] = {

    init: function() {
      this.setColour(BLOCK_COLOR.ros_act);
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage('/img/icon/ACT.png', 61, 15, '*'))
        .appendField(name);
      this.appendValueInput('CTX').appendField('context :');
      this.appendValueInput('GOAL').appendField('goal :');
      this.appendValueInput('TIMEOUT').appendField('timeout :');

      this.setInputsInline(true);

      this.appendStatementInput('ON_RESULT')
        .appendField("Result")
        .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

      this.appendStatementInput('ON_FEEDBACK')
        .appendField("Feedback")
        .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');

      this.appendStatementInput('ON_TIMEOUT')
        .appendField("Timeout")

      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    },
    getVars: function(){
      return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

    },

  };
  Blockly.JavaScript['ros_scheduled_action_' + name] = function(block){
    var extraConfig = block.extra_config;

    // var name = block.getFieldValue('NAME');
    // var type = block.getFieldValue('TYPE');

    var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
    var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
    var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
    var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');

    var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";
    var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";



    // var remappings = R.pipe(
        // R.map(function(v, k){ return {remap_from: k, remap_to: v}; }),
        // R.values
    // )(extraConfig.remappings);


    var tpl = '$engine.runScheduledAction(<%= ctx %>, "<%= name %>", "<%= type %>", <%= goal %>, ';
    tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>});';

    var code = _.template(tpl)({
      rapp: rapp,
      uri: uri,
      name: name,
      type: type,
      goal: goal, 
      ctx: ctx, 
      param1: paramNameOnResult,
      param2: paramNameOnFeedback,
      code1: codeOnResult, code2: codeOnFeedback
    });
    return code;


  }

  Blockly.Blocks['ros_scheduled_action_'+name] = {

    init: function() {
      this.setColour(BLOCK_COLOR.ros_act);
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage('/img/icon/ACT.png', 61, 15, '*'))
        .appendField(name);
      this.appendValueInput('CTX').appendField('context :');
      this.appendValueInput('GOAL').appendField('goal :');

      this.setInputsInline(true);

      this.appendStatementInput('ON_RESULT')
        .appendField("Result")
        .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

      this.appendStatementInput('ON_FEEDBACK')
        .appendField("Feedback")
        .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    },
    getVars: function(){
      return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

    },

    // mutationToDom: function() {
      // if(this.extraConfig){
        // var container = document.createElement('mutation');
        // container.setAttribute('config', JSON.stringify(this.extraConfig));
        // return container;
      // }
    // },
    // domToMutation: function(xmlElement) {
      // var cfg = xmlElement.getAttribute('config');
      // console.log("D2M", cfg);

      // try{
        // this.extraConfig = JSON.parse(cfg);
      // }catch(e){
      // }
    // }

  };

};
Blockly.register_action_block = function(name, type){
  Blockly.JavaScript['ros_action_' + name] = function(block){
    // var name = block.getFieldValue('NAME');
    // var type = block.getFieldValue('TYPE');

    var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
    var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
    var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
    var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');

    var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";

    var tpl = '$engine.runAction("<%= name %>", "<%= type %>", <%= goal %>, ';
    tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>});';

    var code = _.template(tpl)({name: name, type: type, goal: goal, 
      param1: paramNameOnResult, param2: paramNameOnFeedback,
      code1: codeOnResult, code2: codeOnFeedback
    });
    return code;


  }

  Blockly.Blocks['ros_action_'+name] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this Blockly.Block
     */
    init: function() {
      this.setColour(BLOCK_COLOR.ros_act);
      this.appendValueInput('GOAL')
        .appendField(new Blockly.FieldImage('/img/icon/ACT.png', 61, 15, '*'))
        .appendField(name);

      this.setInputsInline(true);

      this.appendStatementInput('ON_RESULT')
        .appendField("Result")
        .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

      this.appendStatementInput('ON_FEEDBACK')
        .appendField("Feedback")
        .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');
      this.setPreviousStatement(true);
      return this.setNextStatement(true);
    },

    getVars: function(){
      return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

    }

  };

};
// Blockly.JavaScript['ros_action_item'] = function(block){

  // // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  // var key = block.getFieldValue('KEY');
  // var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  // var code = key + ":" + value;

  // return [code, Blockly.JavaScript.ORDER_ATOMIC];

// }
// Blockly.JavaScript['object_create_with'] = function(block){

  // // Create a list with any number of elements of any type.
  // var code = new Array(block.itemCount_);
  // for (var n = 0; n < block.itemCount_; n++) {
    // code[n] = Blockly.JavaScript.valueToCode(block, 'ADD' + n,
        // Blockly.JavaScript.ORDER_COMMA) || 'null';
  // }
  // code = '({' + code.join(', ') + '})';
  // return [code, Blockly.JavaScript.ORDER_ATOMIC];

// }

Blockly.JavaScript['ros_action_timeout'] = function(block){
  // var name = block.getFieldValue('NAME');
  // var type = block.getFieldValue('TYPE');
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";
  var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
  var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
  var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
  var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');
  var codeOnTimeout = Blockly.JavaScript.statementToCode(block, 'ON_TIMEOUT');

  var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";

  var tpl = '$engine.runAction(<%= name %>, <%= type %>, <%= goal %>, ';
  tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>}, function(){ <%= code3 %> }, <%= options %>);';

  var code = _.template(tpl)({name: name, type: type, goal: goal, 
    param1: paramNameOnResult, param2: paramNameOnFeedback,
    code1: codeOnResult, code2: codeOnFeedback,
    code3: codeOnTimeout,
    options: angular.toJson({})
  });
  return code;

}

Blockly.Blocks['ros_action_timeout'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(BLOCK_COLOR.ros_act);
    this.appendValueInput('NAME')
      .appendField(new Blockly.FieldImage('/img/icon/ACT.png', 61, 15, '*'))
    this.appendValueInput('TYPE').appendField('type :');
    this.appendValueInput('TIMEOUT').appendField('timeout :');
    this.appendValueInput('GOAL').appendField("goal :").setAlign(Blockly.ALIGN_RIGHT)

    this.setInputsInline(true);

    this.appendStatementInput('ON_RESULT')
      .appendField("Result")
      .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

    this.appendStatementInput('ON_FEEDBACK')
      .appendField("Feedback")
      .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');

    this.appendStatementInput('ON_TIMEOUT')
      .appendField("Timeout")

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

  getVars: function(){
    return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

  }

};

Blockly.JavaScript['ros_action'] = function(block){
  // var name = block.getFieldValue('NAME');
  // var type = block.getFieldValue('TYPE');
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";
  var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
  var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
  var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
  var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');

  var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";

  var tpl = '$engine.runAction(<%= name %>, <%= type %>, <%= goal %>, ';
  tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>});';

  var code = _.template(tpl)({name: name, type: type, goal: goal, 
    param1: paramNameOnResult, param2: paramNameOnFeedback,
    code1: codeOnResult, code2: codeOnFeedback
  });
  return code;

}

Blockly.Blocks['ros_action'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(BLOCK_COLOR.ros_act);
    this.appendValueInput('NAME')
      .appendField(new Blockly.FieldImage('/img/icon/ACT.png', 61, 15, '*'))
    this.appendValueInput('TYPE').appendField('type :');
    this.appendValueInput('GOAL').appendField("goal :").setAlign(Blockly.ALIGN_RIGHT)

    this.setInputsInline(true);

    this.appendStatementInput('ON_RESULT')
      .appendField("Result")
      .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

    this.appendStatementInput('ON_FEEDBACK')
      .appendField("Feedback")
      .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');

    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  },

  getVars: function(){
    return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

  }

};
