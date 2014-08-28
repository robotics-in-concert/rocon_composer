
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
  var name = block.getFieldValue('NAME');
  var type = block.getFieldValue('TYPE');
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
    this.appendValueInput('GOAL')
      .appendField("[ROS] action")
      .appendField(new Blockly.FieldTextInput('name', null), 'NAME')
      .appendField(new Blockly.FieldTextInput('type', null), 'TYPE')
      .appendField("goal :").setAlign(Blockly.ALIGN_RIGHT);

    this.appendStatementInput('ON_RESULT')
      .appendField("Result")
      .appendField(new Blockly.FieldVariable('item'), 'ON_RESULT_PARAM');

    this.appendStatementInput('ON_FEEDBACK')
      .appendField("Feedback")
      .appendField(new Blockly.FieldVariable('item'), 'ON_FEEDBACK_PARAM');
    // this.setMutator(new Blockly.Mutator(['object_create_with_item']));
  },

  getVars: function(){
    return [this.getFieldValue('ON_RESULT_PARAM'), this.getFieldValue('ON_FEEDBACK_PARAM')];

  },

//   /**
//    * Create XML to represent list inputs.
//    * @return {Element} XML storage element.
//    * @this Blockly.Block
//    */
//   mutationToDom: function() {
//     var container = document.createElement('mutation');
//     container.setAttribute('items', this.itemCount_);
//     return container;
//   },
//   /**
//    * Parse XML to restore the list inputs.
//    * @param {!Element} xmlElement XML storage element.
//    * @this Blockly.Block
//    */
//   domToMutation: function(xmlElement) {
//     for (var x = 0; x < this.itemCount_; x++) {
//       this.removeInput('ADD' + x);
//     }
//     this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
//     for (var x = 0; x < this.itemCount_; x++) {
//       var input = this.appendValueInput('ADD' + x);
//       if (x == 0) {
//         input.appendField("create object with");
//       }
//     }
//     if (this.itemCount_ == 0) {
//       this.appendDummyInput('EMPTY')
//           .appendField("create emtpy object");
//     }
//   },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        Blockly.Block.obtain(workspace, 'object_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = Blockly.Block.obtain(workspace, 'object_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('ADD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_);
      if (this.itemCount_ == 0) {
        input.appendField("create object with");
      }
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendField("create empty object");
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Blocks['ros_action_options_container'] = {
  /**
   * Mutator block for list container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField("Object");
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  }
};
