
Blockly.register_scheduled_action_block = function(rapp, uri, name, type){
  Blockly.JavaScript['ros_scheduled_action_' + name] = function(block){
    var extraConfig = JSON.parse(block.extraConfig);

    // var name = block.getFieldValue('NAME');
    // var type = block.getFieldValue('TYPE');

    var codeOnResult = Blockly.JavaScript.statementToCode(block, 'ON_RESULT');
    var paramNameOnResult = block.getFieldValue('ON_RESULT_PARAM');
    var codeOnFeedback = Blockly.JavaScript.statementToCode(block, 'ON_FEEDBACK');
    var paramNameOnFeedback = block.getFieldValue('ON_FEEDBACK_PARAM');

    var goal = Blockly.JavaScript.valueToCode(block, 'GOAL', Blockly.JavaScript.ORDER_NONE) || "''";




    var remappings = R.pipe(
        R.mapObj.idx(function(v, k){ return {remap_from: k, remap_to: v}; }),
        R.values
    )(extraConfig.remappings);
    var parameters = [];

    var tpl = '$engine.runScheduledAction("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, "<%= name %>", "<%= type %>", <%= goal %>, ';
    tpl += 'function(<%= param1 %>){ <%=code1%>}, function(<%= param2 %>){ <%=code2%>});';

    var code = _.template(tpl)({rapp: rapp, uri: uri, name: '/deli_111', type: type, goal: goal, 
      remappings: JSON.stringify(remappings),
        parameters: JSON.stringify(parameters),
      param1: paramNameOnResult, param2: paramNameOnFeedback,
      code1: codeOnResult, code2: codeOnFeedback
    });
    return code;


  }

  Blockly.Blocks['ros_scheduled_action_'+name] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this Blockly.Block
     */
    init: function() {
      this.setColour(260);
      this.appendValueInput('GOAL').appendField('[Action] ' + name);

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
    mutationToDom: function() {
      var container = document.createElement('config');
      container.setAttribute('value', this.extraConfig);
      return container;
    },
    domToMutation: function(xmlElement) {
      var cfg = xmlElement.getAttribute('value');
      this.extraConfig = cfg;
    }

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
      this.setColour(260);
      this.appendValueInput('GOAL').appendField('[Action] ' + name);

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


  // return [name, type, codeOnResult, paramNameOnResult, codeOnFeedback, paramNameOnFeedback].join("\n\n");
  //

  // // The ActionClient
  // // ----------------

  // var fibonacciClient = new ROSLIB.ActionClient({
    // ros : ros,
    // serverName : '/fibonacci',
    // actionName : 'actionlib_tutorials/FibonacciAction'
  // });

  // // Create a goal.
  // var goal = new ROSLIB.Goal({
    // actionClient : fibonacciClient,
    // goalMessage : {
      // order : 7
    // }
  // });

  // // Print out their output into the terminal.
  // goal.on('feedback', function(feedback) {
    // console.log('Feedback: ' + feedback.sequence);
  // });
  // goal.on('result', function(result) {
    // console.log('Final Result: ' + result.sequence);
  // });

  // // Send the goal to the action server.
  // goal.send();

}

Blockly.Blocks['ros_action'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendValueInput('NAME').appendField('[ROS] action name :');
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
