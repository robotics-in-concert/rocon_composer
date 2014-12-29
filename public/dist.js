var ACTION_COLOR, DESTINATION_COLOR, declare_event;

ACTION_COLOR = 100;

DESTINATION_COLOR = 3;

['huey', 'dwlee', 'docking'].forEach(function(dest) {
  Blockly.Blocks["dest_" + dest] = {
    init: function() {
      this.setColour(DESTINATION_COLOR);
      this.appendDummyInput('XX').appendField(dest);
      this.setOutput(true, 'String');
      this.setPreviousStatement(false);
      return this.setNextStatement(false);
    },
    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('config', this.extraConfig);
      return container;
    },
    domToMutation: function(xmlElement) {
      console.log("DOM2MUT", xmlElement);

      var cfg = xmlElement.getAttribute('config');
      this.extraConfig = cfg;
    }
  };
  return Blockly.JavaScript["dest_" + dest] = function(block) {
    return ["'" + dest + "'", Blockly.JavaScript.ORDER_NONE];
  };
});

['phone_start', 'robot_button', 'phone_deliver'].forEach(function(dest) {
  Blockly.Blocks["entity_" + dest] = {
    init: function() {
      this.setColour(DESTINATION_COLOR);
      this.appendDummyInput('XX').appendField(dest);
      this.setOutput(true, 'String');
      this.setPreviousStatement(false);
      return this.setNextStatement(false);
    }
  };
  return Blockly.JavaScript["entity_" + dest] = function(block) {
    return ["'" + dest + "'", Blockly.JavaScript.ORDER_NONE];
  };
});

['message', 'msg', 'dest'].forEach(function(x) {
  Blockly.Blocks["memory_" + x] = {
    init: function() {
      this.setColour(DESTINATION_COLOR);
      this.appendDummyInput('XX').appendField("Memory : " + x);
      this.setOutput(true, 'String');
      this.setPreviousStatement(false);
      return this.setNextStatement(false);
    }
  };
  return Blockly.JavaScript["memory_" + x] = function(block) {
    return ["$engine.memory." + x, Blockly.JavaScript.ORDER_NONE];
  };
});

Blockly.Blocks["cond_no_brain"] = {
  init: function() {
    this.setColour(150);
    this.appendDummyInput('XX').appendField('No destination or No message');
    this.setOutput(true, 'Boolean');
    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  }
};

Blockly.JavaScript['cond_no_brain'] = function(block) {
  return ["(!$engine.memory.dest || !$engine.memory.msg)", Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks["action_set"] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('DEST').appendField('Set Destination to ');
    this.appendValueInput('MSG').appendField('with message');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['action_set'] = function(block) {
  var dest, msg;
  dest = Blockly.JavaScript.valueToCode(block, 'DEST', Blockly.JavaScript.ORDER_NONE) || "''";
  msg = Blockly.JavaScript.valueToCode(block, 'MSG', Blockly.JavaScript.ORDER_NONE) || "''";
  return "$engine.memory = {dest: " + dest + ", msg: " + msg + "};";
};

declare_event = function(key, name) {
  Blockly.Blocks["event_" + key] = {
    init: function() {
      this.setColour(200);
      this.appendValueInput('PARAM').appendField(name);
      this.setOutput(true, 'TEXT');
      this.setPreviousStatement(false);
      return this.setNextStatement(false);
    }
  };
  return Blockly.JavaScript["event_" + key] = function(block) {
    var data, param;
    data = {
      event_name: key
    };
    param = Blockly.JavaScript.valueToCode(block, 'PARAM', Blockly.JavaScript.ORDER_NONE) || "''";
    if (param != null) {
      data.param = eval(param);
    }
    return [JSON.stringify(data), Blockly.JavaScript.ORDER_ATOMIC];
  };
};

declare_event("arrive", "Arrive");

declare_event("delivery_request", "Delivery Request");

declare_event("confirm", "Confirm");

declare_event("foo", "Foo");




Blockly.Blocks['test_event_handle'] = {
  init: function() {
    this.setColour(10);
    this.appendValueInput('VALUE').appendField('on');
    this.appendStatementInput('DO').appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  }
};

Blockly.Blocks['turtle_cmd_vel'] = {
  init: function() {
    this.setColour(10);

    // this.interpolateMsg(
        // // TODO: Combine these messages instead of using concatenation.
        // "x = %1, y = %2, z = %3",
        // ['X1', 'Number', Blockly.ALIGN_RIGHT],
        // ['Y1', 'Number', Blockly.ALIGN_RIGHT],
        // ['Z1', 'Number', Blockly.ALIGN_RIGHT],
        // Blockly.ALIGN_RIGHT);
    // var numberInput = new Blockly.FieldTextInput('0');
    // this.appendValueInput(numberInput, 'xxx');
    this.appendValueInput('l_x').appendField('cmd_vel linear with x').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('l_y').appendField('y').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('l_z').appendField('z').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('a_x').appendField('angular with x').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('a_y').appendField('y').setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('a_z').appendField('z').setAlign(Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['turtle_cmd_vel'] = function(block) {
  var code, e, event;
  x0 = eval(Blockly.JavaScript.valueToCode(block, 'l_x', Blockly.JavaScript.ORDER_NONE));
  y0 = eval(Blockly.JavaScript.valueToCode(block, 'l_y', Blockly.JavaScript.ORDER_NONE));
  z0 = eval(Blockly.JavaScript.valueToCode(block, 'l_z', Blockly.JavaScript.ORDER_NONE));
  x1 = eval(Blockly.JavaScript.valueToCode(block, 'a_x', Blockly.JavaScript.ORDER_NONE));
  y1 = eval(Blockly.JavaScript.valueToCode(block, 'a_y', Blockly.JavaScript.ORDER_NONE));
  z1 = eval(Blockly.JavaScript.valueToCode(block, 'a_z', Blockly.JavaScript.ORDER_NONE));

  x = {
    linear: {
              x: x0,
              y: y0,
              z: z0
            },
    angular: {
              x: x1,
              y: y1,
              z: z1
            }


  }


  return "$engine.cmdVel("+JSON.stringify(x)+");";
  // e = JSON.parse(event);
  // console.log("event", e);
  // code = Blockly.JavaScript.statementToCode(block, 'DO');
  // var en = e.event_name;
  // var body = code;
  // if(e.param){
    // body = "if(data.param === '"+e.param+"'){ "+code+" }";
  // }
  // return "$engine.ee.on('" + en + "', function(data){ " + body + " })";
};


Blockly.JavaScript['test_event_handle'] = function(block) {
  var code, e, event;
  event = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  e = JSON.parse(event);
  console.log("event", e);
  code = Blockly.JavaScript.statementToCode(block, 'DO');
  var en = e.event_name;
  var body = code;
  if(e.param){
    body = "if(data.param === '"+e.param+"'){ "+code+" }";
  }
  return "$engine.ee.on('" + en + "', function(data){ " + body + " })";
};

Blockly.Blocks['action_speak'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE').appendField('Speak');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

['action_speak'].forEach(function(action_key) {
  return Blockly.JavaScript[action_key] = function(block) {
    var arg0;
    arg0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";

    return '$engine.print("Rocon Authoring :" + JSON.stringify(' + arg0 + '));';
  };
});

Blockly.Blocks['action_go_to'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE').appendField('Go to');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

['action_go_to'].forEach(function(action_key) {
  return Blockly.JavaScript[action_key] = function(block) {
    var arg0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    return '$engine.publish("go_to");';
  };
});

Blockly.Blocks['action_navigate'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('DEST').appendField('Navigate To');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

['action_navigate'].forEach(function(action_key) {
  return Blockly.JavaScript[action_key] = function(block) {
    var arg0;
    arg0 = Blockly.JavaScript.valueToCode(block, 'DEST', Blockly.JavaScript.ORDER_NONE) || "''";
    return '$engine.print("NAVIGATE TO:"+ ' + arg0 + ');';
  };
});

Blockly.Blocks['delay'] = {
  init: function() {
    this.setColour(10);
    this.appendValueInput('DELAY').setCheck('Number').appendField('Delay');
    this.appendStatementInput('DO').appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['delay'] = function(block) {
  var code, delay;
  delay = Blockly.JavaScript.valueToCode(block, 'DELAY', Blockly.JavaScript.ORDER_NONE) || "''";
  code = Blockly.JavaScript.statementToCode(block, 'DO');
  return "setTimeout(function(){" + code + "}, " + delay + "*1000);";
};

















/*
 * Sleep
 */
Blockly.Blocks['action_sleep'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('VALUE').appendField('sleep');
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};

Blockly.JavaScript['action_sleep'] = function(block) {
  var arg0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  return _.template('$engine.sleep(<%= ms %>);')({ms: arg0});
};



var ros_block_override = function(){
  var ros_block_keys = R.pipe(
    R.keys,
    R.filter(R.match(/^ros_/))
  )(Blockly.Blocks);


  R.map(function(key){
    var b = Blockly.Blocks[key];
    console.log(key, b.configable);

    if(b.configable){
      b.customContextMenu = function(opts){
        opts.push({text: 'Config', enabled: true, callback: function(){ 
          $('#block-config-modal').modal();
        }});
        return opts;

      };
    }


    b.mutationToDom = function() {
      var re = null;
      var container = re = document.createElement('mutation');
      ['extra_config', 'extra'].forEach(function(attr){
        if(this[attr]){
          container.setAttribute(attr, JSON.stringify(this[attr]));
        }
      }.bind(this));


      if(typeof b._mutationToDom != 'undefined'){
        re = b._mutationToDom(re);
      }
      return re;

    };
    b.domToMutation = function(xmlElement) {
      ['extra_config', 'extra'].forEach(function(attr){

        var attrv = xmlElement.getAttribute(attr);
        console.log("ATTR", attrv);

        try{
          this[attr] = JSON.parse(attrv);
        }catch(e){
        }
      }.bind(this));
      if(typeof b._domToMutation != 'undefined'){
        re = b._domToMutation();
      }
    };

  })(ros_block_keys);



  console.log(ros_block_keys);
}




Blockly.Blocks['lodash_find'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
      .appendField('find first item in array')
      .appendField(new Blockly.FieldVariable('item', null), 'VAR')
    this.appendDummyInput().appendField('where').appendField(new Blockly.FieldTextInput('key', null), 'KEY');
    this.appendValueInput('VAL').appendField('is');
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};


Blockly.JavaScript['lodash_find'] = function(block){
  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var arr = block.getFieldValue('VAR');
  var key = block.getFieldValue('KEY');
  var val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_NONE) || "''";

  
  // var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  // var code = key + ":" + value;
  //
  var code = _.template("_.find(<%= arr%>, function(i){ return i['<%= key%>'] === <%= val %>; })", {arr: arr, key: key, val: val})

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

};


// Blockly.JavaScript['object_item'] = function(block){

  // // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  // var key = block.getFieldValue('KEY');
  // var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  // var code = key + ":" + value;

  // return [code, Blockly.JavaScript.ORDER_ATOMIC];

// }


/*
 * object
 */

Blockly.Blocks['object_item'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('key', null), 'KEY')
        .appendField(":")
    this.appendValueInput('VALUE')
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};
Blockly.Blocks['object_item_get2'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable('item', null), 'VAR')
    this.appendValueInput('KEY').appendField('.');
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};
Blockly.Blocks['object_item_get'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable('item', null), 'VAR')
        .appendField(".");
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput('key', null), 'KEY');
    this.setInputsInline(true);
    this.setOutput(true);
    this.contextMenu = false;
  }
};
Blockly.Blocks['object_item_set'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable('item', null), 'VAR')
        .appendField(".");
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput('key', null), 'KEY');
    this.appendValueInput('VALUE')
      .appendField("=")
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = false;
  }
};

Blockly.Blocks['object_create_with_item'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField("item");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = false;
  }
};

Blockly.JavaScript['object_item'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var key = block.getFieldValue('KEY');
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var code = key + ":" + value;

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

}
Blockly.JavaScript['object_item_get2'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var va = block.getFieldValue('VAR');
  var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var tpl = "<%= va %>[<%= key %>]";
  var code = _.template(tpl)({va: va, key: key});

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

}
Blockly.JavaScript['object_item_get'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var va = block.getFieldValue('VAR');
  var key = block.getFieldValue('KEY');
  var tpl = "<%= va %>['<%= key %>']";
  var code = _.template(tpl)({va: va, key: key});

  return [code, Blockly.JavaScript.ORDER_ATOMIC];

}
Blockly.JavaScript['object_item_set'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var va = block.getFieldValue('VAR');
  var key = block.getFieldValue('KEY');
  var tpl = "<%= va %>['<%= key %>'] = <%= value %>;";
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "null";
  var code = _.template(tpl)({va: va, key: key, value: value});

  // return [code, Blockly.JavaScript.ORDER_ATOMIC];
  return code;

}
Blockly.JavaScript['object_create_with'] = function(block){

  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.JavaScript.valueToCode(block, 'ADD' + n,
        Blockly.JavaScript.ORDER_COMMA) || 'null';
  }
  code = '({' + code.join(', ') + '})';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];

}

Blockly.Blocks['object_create_with'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(260);
    this.appendValueInput('ADD0')
        .appendField("create object with");
    this.appendValueInput('ADD1');
    this.appendValueInput('ADD2');
    this.setOutput(true, 'Array');
    this.setMutator(new Blockly.Mutator(['object_create_with_item']));
    this.itemCount_ = 3;
  },
  /**
   * Create XML to represent list inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x);
      if (x == 0) {
        input.appendField("create object with");
      }
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendField("create emtpy object");
    }
  },
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

Blockly.Blocks['object_create_with_container'] = {
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



Blockly.register_scheduled_action_block = function(rapp, uri, name, type){
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
      this.setColour(260);
      this.appendDummyInput().appendField('[Action] ' + name);
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


var msg_registered = [];
Blockly.register_message_block = function(type, meta, tooltip){
  if(!_.include(msg_registered, type)){
    var blockKey = "ros_msg_" + type.replace("/", "-");
    Blockly.Blocks[blockKey] = {
      init: function() {
        var block = this;
        this.setColour(77);
        //
        this.appendDummyInput().appendField(type);
        _.each(meta.fieldnames, function(fn, idx){

          block.appendValueInput(fn.toUpperCase()).appendField(fn);

        });
        // this.setTooltip(tooltip);
        this.setHelpUrl(MSG_DATABASE + "/message_detail?type="+type);
        this.setOutput(true);
        this.setHelpUrl(MSG_DATABASE + "/message_detail?type="+type);

        this.setPreviousStatement(false);
        return this.setNextStatement(false);
      }
    };
    Blockly.JavaScript[blockKey] = function(block){
      var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '""';
      var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>);';
      var code = '';
      var kv = [];
      _.each(meta.fieldnames, function(fn, idx){
        var v = Blockly.JavaScript.valueToCode(block, fn.toUpperCase(), Blockly.JavaScript.ORDER_NONE) || "''";
        kv.push("\"" + fn + "\":" + v);

      });
      return ["({"+kv.join(",")+"})", Blockly.JavaScript.ORDER_ATOMIC ];

    };


    msg_registered.push(type);

  // Blockly.JavaScript[blockKey] = function(block) {
    // var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    // var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>);';
    // return _.template(tpl)({name: name, type: type, msg: msg});
  // };
  }

};



Blockly.register_scheduled_publish_block = function(rapp, uri, name, type){
  Blockly.Blocks['ros_scheduled_publish_'+name] = {

    init: function() {
      this.setColour(ACTION_COLOR);
      this.appendDummyInput().appendField('[Publish] ' + name);
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
    var ctx = Blockly.JavaScript.valueToCode(block, 'CTX', Blockly.JavaScript.ORDER_NONE) || "''";
    var tpl = "$engine.scheduledSubscribe(<%= ctx %>, '<%= name %>', '<%= type %>', function(<%= param0 %>){ <%= code %> });";
    return _.template(tpl)({ctx: ctx, name: name, type: type, code: code, param0: param0});

  };


  Blockly.Blocks['ros_scheduled_subscribe_'+name] = {

    init: function() {
      this.extra = extra;
      this.setColour(10);
      this.appendDummyInput().appendField('[Subscribe] ' + name);
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



Blockly.Blocks['ros_requester_allocate'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("Allocate Resource");
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('resource', null), 'VAR')
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


  var tpl = 'var <%= var_name %> = ($engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= options %>)); ';

  var code = _.template(tpl)({
    var_name: this.getFieldValue('VAR'),
    rapp: config.rapp, 
    uri: config.uri, 
    remappings: JSON.stringify(config.remappings),
    parameters: JSON.stringify(config.parameters),
    options: JSON.stringify({timeout: config.timeout})
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



Blockly.Blocks['ros_service'] = {
  init: function() {
    this.setColour(ACTION_COLOR);
    this.appendValueInput('NAME').appendField('[ROS] call service :');
    this.appendValueInput('TYPE').appendField('type :');
    this.appendValueInput('VALUE').appendField('message :');

    this.setInputsInline(true);
    this.setOutput(true);
  }
};

Blockly.JavaScript['ros_service'] = function(block) {
  var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
  var name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || "''";
  var type = Blockly.JavaScript.valueToCode(block, 'TYPE', Blockly.JavaScript.ORDER_NONE) || "''";

  var tpl = '($engine.runService(<%= name %>, <%= type %>, <%= msg %>))';
  var code =_.template(tpl)({name: name, type: type, msg: msg});
  return [code, Blockly.JavaScript.ORDER_NONE];
};



Blockly.JavaScript['declare_var'] = function(block){

  // var key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || "''";
  var va = Blockly.JavaScript.valueToCode(block, 'VAR', Blockly.JavaScript.ORDER_NONE) || "''";
  var tpl = "var <%= va %>;";
  var code = _.template(tpl)({va: va});

  return code;

}
Blockly.Blocks['declare_var'] = {
  init: function() {
    this.appendValueInput('VAR').appendField('Declare Variable');
    this.setInputsInline(true);
    this.contextMenu = false;
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};
/*
 * functions
 */

Blockly.register_function_block = function(name, args, has_return){
  Blockly.Blocks['udf_'+name] = {
    init: function() {
      this.setColour(240);
      this.appendDummyInput().appendField(name);
      var blk = this;

      _.each(args, function(arg){
        blk.appendValueInput(arg.toUpperCase()).appendField(arg);

      });

      this.setInputsInline(false);


      if(has_return){
        this.setOutput(true);
        this.setPreviousStatement(false);
        this.setNextStatement(false);
      }else{
        this.setOutput(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
    }
  };
  Blockly.JavaScript['udf_'+name] = function(block) {
    var funcName = name;
    var _args = _.map(args, function(a){
      return Blockly.JavaScript.valueToCode(block, a.toUpperCase(), Blockly.JavaScript.ORDER_COMMA) || 'null';
    });
    var code = funcName + '(' + _args.join(', ') + ');';
    if(has_return){
      return [code, Blockly.JavaScript.ORDER_ATOMIC];
    }
    return code;
  };


  // Blockly.JavaScript['ros_publish_'+name] = function(block) {
    // var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    // var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>);';
    // return _.template(tpl)({name: name, type: type, msg: msg});
  // };

};

/*
 * Sleep
 */
Blockly.Blocks['json'] = {
  init: function() {
    // this.setColour(ACTION_COLOR);
    this.appendDummyInput()
      .appendField("JSON")
      .appendField(new Blockly.FieldTextInput('{}', null), 'JSON')
    this.setOutput(true, 'Array');
    this.setPreviousStatement(false);
    return this.setNextStatement(false);
  }
};

Blockly.JavaScript['json'] = function(block) {
  var json = block.getFieldValue('JSON');
  var code = _.template("JSON.parse('<%= json%>')")({json: json});


  return [json, Blockly.JavaScript.ORDER_ATOMIC];
};

/*
 * defer
 */
Blockly.Blocks['defer'] = {
  init: function() {
    // this.setColour(ACTION_COLOR);
    this.appendStatementInput('DO')
      .appendField('background')

    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['defer'] = function(block) {
  var code = Blockly.JavaScript.statementToCode(block, 'DO');
  return _.template("setTimeout(function(){ Fiber(function(){<%= code %>}).run(); }, 0);")({code: code});
};

var BlockGenerator = function(){

  this.message_blocks = [];
  this.type_blocks = {};
  this.subscribe_blocks = [];

};

BlockGenerator.prototype._singleBlock = function(fieldtype){
    if(fieldtype.match(/string/)){
      return $('<block type="text"><field name="TEXT"></field></block>');
    }else if(fieldtype.match(/float|uint|int|time/)){
      return $('<block type="math_number"><field name="NUM">0</field></block>');
    }
};

BlockGenerator.prototype._buildBlockTree = function(lst, meta, parent){
  console.log('build block tree', meta);
  var that = this;

  if(!parent)
    var p = $('<block />').attr('type', 'ros_msg_'+meta.type.replace('/', '-'));
  else
    p = parent;

  
  
  _.each(meta.fieldtypes, function(fieldtype, idx){
    var arrlen = meta.fieldarraylen[idx];
    var fn = meta.fieldnames[idx];
    if(meta.type.match(/.+Action$/) && fn != 'action_goal'){ // if action block
      return;
    }

    if(_.include(['action_feedback'], fn)){
      return;
    }
    var $val = null;
    var $child = null;


    if(arrlen == -1){
      $child = $val = $('<value name="'+fn.toUpperCase()+'" />');
    }else if(arrlen >= 0){
      $child = $('<value name="'+fn.toUpperCase()+'"></value>');
      var $list = $('<block type="lists_create_with"><mutation items="1"></mutation><value name="ADD0"></value></block>');
      $val = $list.find('value[name=ADD0]');
      $child.append($list);

    }



    if(fieldtype.match(/.+\/.+/)){
      var subtype = _.detect(lst, function(e, k){ console.log(k, meta.fieldtypes[idx]); return meta.fieldtypes[idx] == k })
      var $subDom = that._buildBlockTree(lst, subtype);
      $val.append($subDom);
    }else{
      $val.append(that._singleBlock(fieldtype));

    }
    p.append($child);


  });


  console.info("built", meta.type, p.get(0));

  return p;
};
// var $el = buildBlockTree(x.types['nav_msgs/MapMetaData'], x.types['nav_msgs/MapMetaData']['nav_msgs/MapMetaData']);
// console.log($el.get(0));
// $tb.find('category[name=ROS]').append($el.get(0));

// var $el = buildBlockTree(x.types['std_msgs/String'], x.types['std_msgs/String']['std_msgs/String']);
// console.log($el.get(0));
// $tb.find('category[name=ROS]').append($el.get(0));


BlockGenerator.prototype.generate_message_blocks = function(types){
  var that = this;
  _.each(types, function(topType){
    _.each(topType, function(tt){
      if(R.contains(tt.type, that.message_blocks)){
        return;
      }
      that.message_blocks.push(tt.type);

      Blockly.register_message_block(tt.type, tt, tt.text);
      var blockKey = tt.type.replace('/', '-');
      console.log('register msg block', tt.type);

    });
  });

};
BlockGenerator.prototype.generate_subscribe_block = function(){

// _.each(meta.subscribers, function(sub){
  // Blockly.register_publish_block(sub.name, sub.type);
  // var typeBlock = typesBlocks[sub.type];
  // var $tb = $('#toolbox');
  // var $pubBlock = $('<block type="ros_publish_'+sub.name+'"></block>');
  // var $valueBlock = $('<value name="VALUE"></value>');
  // $valueBlock.append(typeBlock);
  // $pubBlock.append($valueBlock);
  // $tb.find('category[name=ROS]').append($pubBlock);
  // console.log("register publish block", sub);


// });
};

BlockGenerator.prototype.message_block_dom = function(k, subTypes){

  if(k.match(/.+Action$/)){
    var t = subTypes[k];
    var x = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes));
    var goal_t = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes))['action_goal'];
    t = subTypes[goal_t];
    goal_t = R.fromPairs(R.zip(t.fieldnames, t.fieldtypes))['goal'];
    t = subTypes[goal_t];
    var $el = this._buildBlockTree(subTypes, t);

  }else{
    var $el = this._buildBlockTree(subTypes, subTypes[k]);
  }

  $el.attr('collapsed', true);
  this.type_blocks[k] = $el.get(0);
  return $el;

};

BlockGenerator.prototype.scheduled_action_block_dom = function(rapp_name, uri, name, type){
  var typeBlock = this.type_blocks[type];
  var $valueBlock = $('<value name="GOAL"></value>');
  $valueBlock.append($(typeBlock).clone());

  Blockly.register_scheduled_action_block(rapp_name, uri, name, type);
  var $block = $('<block type="ros_scheduled_action_'+name+'"></block>');
  $block.append($valueBlock);
  return $block;


};

BlockGenerator.prototype.scheduled_subscribe_block_dom = function(rapp_name, uri, name, type){
  var typeBlock = this.type_blocks[type];
  Blockly.register_scheduled_subscribe_block(rapp_name, uri, name, type);
  var $block = $('<block type="ros_scheduled_subscribe_'+name+'"></block>');
  return $block;


};
BlockGenerator.prototype.scheduled_publish_block_dom = function(rapp_name, uri, name, type){
  var typeBlock = this.type_blocks[type];
  var $valueBlock = $('<value name="VALUE"></value>');
  $valueBlock.append($(typeBlock).clone());

  Blockly.register_scheduled_publish_block(rapp_name, uri, name, type);
  var $block = $('<block type="ros_scheduled_publish_'+name+'"></block>');
  $block.append($valueBlock);
  return $block;


};

BlockGenerator.prototype.subscribe_block_dom = function(opts){
  var name = opts.name;
  if(R.contains(name, this.subscribe_blocks)){
    return false;
  }
  this.subscribe_blocks.push(name);
  Blockly.register_subscribe_block(name, opts.type, {client_app_id: opts.client_app_id});
  var $block = $('<block type="ros_subscribe_'+name+'"></block>');
  return $block;


};


R.mapProp = R.compose( R.map, R.prop );

var _uuid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
      return [s4() + s4(),
        s4(),
        s4(),
        s4(),
        s4() + s4() + s4()].join("");
  };
})();


_js = function(prettify){
  var js = Blockly.JavaScript.workspaceToCode();
  if(prettify) js = js_beautify(js);
  return js;
};

_xml = function(prettify){
  var dom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var xml = Blockly.Xml.domToText(dom);
  if(prettify) xml = vkbeautify.xml(xml);
  return xml;
};


ITEMS_PARAM_KEY = 'cento_authoring_items';
SERVICES_PARAM_KEY = 'cento_authoring_services';

JSONEditor.defaults.options.theme = 'bootstrap3';
$.fn.editable.defaults.mode = 'inline';
$.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="fa fa-check"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel"><i class="fa fa-remove"></i></button>'

var reload_udf_blocks = function(items){

  var $cat = $('category[name=Utils]');

  // $('category[name=Utils] block').remove();
  _.each(items, function(item){
    var parser = new DOMParser();
    var xml = parser.parseFromString(item.xml, "text/xml");

    $(xml).find('block[type=procedures_defreturn],block[type=procedures_defnoreturn]').each(function(b){
      var fname = $(this).find('> field[name]').text();
      var args = $(this).find('mutation arg').map(function(e){ return $(this).attr('name'); }).toArray();
      Blockly.register_function_block(fname, args, $(this).attr('type') == 'procedures_defreturn');

      
      $cat.find('block[type=udf_' + fname + ']').remove();
      $cat.append('<block type="udf_'+fname+'"></block>');


    });
    Blockly.updateToolbox($('#toolbox').get(0));

  });

};


var toggle_header_menu = function(){
  $('#header').toggle();
  if($('#header').is(':visible')){
    $('#header_toggler').hide();
    $('.container0').addClass('down');
  }else{
    $('#header_toggler').show();
    $('.container0').removeClass('down');
  }
  Blockly.fireUiEvent(window, 'resize');
  return false;

};
$(function(){
  $(document.body).on('click', '.toggle_header', toggle_header_menu);
  $(document.body).on('click', '.toggle_right', function(){ $('.container0 .right').toggle(); });
  $(document.body).on('click', '.undo', function(){ window.undo_manager.undo(); });
});
Mousetrap.bind('ctrl+alt+t', function(){
  toggle_header_menu();
  return false;

});
Mousetrap.bind('ctrl+alt+y', function(){
  $('.container0 .right').toggle();
  return false;

});


Mousetrap.bind('ctrl+alt+d', function() { 
  var sel = Blockly.selected;
  Blockly.copy_(sel);
  if (Blockly.clipboard_) {
    Blockly.mainWorkspace.paste(Blockly.clipboard_);
  }
});
Mousetrap.bind('ctrl+alt+c', function() { 
  var sel = Blockly.selected;
  if(sel){
    sel.setCollapsed(!sel.collapsed_);

  }
});

window.searching_keyword = null;


findNext = function(keyword){
  var blks = $(_xml()).find('block[type=text]');
  blks.each(function(){
    var txt = $(this).text().trim().toLowerCase();
    var id = $(this).attr('id');
    var b = Blockly.mainWorkspace.getBlockById(id);

    if( $(this).text().indexOf(keyword) >= 0 && b != Blockly.selected ){
      console.log(id);

      b.select();
      return false;
    }

  });

};

Mousetrap.bind('esc', function() { 
  if(Blockly.selected){
    Blockly.selected.unselect();
    window.searching_keyword = null;
  }

});
Mousetrap.bind('ctrl+alt+r', function() { 
  if(window.searching_keyword){
    findNext(window.searching_keyword);
  };

});

Mousetrap.bind('ctrl+alt+f', function() { 
  var keyword = prompt("search block").toLowerCase();
  window.searching_keyword = keyword;
  findNext(keyword);

  
});


Mousetrap.bind('?', function(){
  $('.shortcut-modal').modal();

});

Mousetrap.bind('ctrl+alt+z', function() { 
  window.undo_manager.undo();
});
Mousetrap.bind('ctrl+alt+j', function() { 
  $('.code-modal .modal-title').text('Javascript');
  var $code = $('.code-modal code');
  $code.text(_js(true));
  $code.attr('class', 'javascript');
  hljs.highlightBlock($('.code-modal code').get(0));
  jQuery('.code-modal').modal({});

});
Mousetrap.bind('ctrl+alt+l', function() { 
  $('.code-modal .modal-title').text('XML');

  var $code = $('.code-modal code');
  $code.text(_xml(true));
  $code.attr('class', 'xml');
  hljs.highlightBlock($('.code-modal code').get(0));
  jQuery('.code-modal').modal({});

});



var app = angular.module('centoAuthoring', ['ui.router', 'ui.select2']);


app.config(function($stateProvider, $interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');


  $stateProvider
    .state('services_index', {
      url: '/services_index',
      templateUrl: '/js/tpl/services_index.html'
    })
    .state('services', {
      url: '/services?new_name',
      templateUrl: '/js/tpl/services.html'
    })
    .state('services_edit', {
      url: '/services/:service_id',
      templateUrl: '/js/tpl/services.html'
    })
    .state('workflow_index', {
      url: '',
      templateUrl: '/js/tpl/workflow_index.html'

    })
    .state('workflow_edit', {
      url: '/blockly/:id',
      templateUrl: '/js/tpl/blockly.html'

    })
    .state('workflow_blockly', {
      url: '/blockly?new_name',
      templateUrl: '/js/tpl/blockly.html'

    });
});
app.directive("roconSelect2", ["$interval", function($interval) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            //On click
            $(elem).select2()
            $(elem).on('change', function(){
              console.log('hh');
              var v = $(elem).select2('val');
              console.log("v", v);


              scope.destPackage = $(elem).select2('val');

            });

        }
    }
}]);


UNDO_CHECK_INTERVAL = 1000;
UNDO_MAX_SIZE = 100;
var UndoManager = function(){
  this.stack = [];


};

UndoManager.prototype.start = function(){
  // this.timer = setInterval(this.pushSnapshot.bind(this), UNDO_CHECK_INTERVAL);
  Blockly.mainWorkspace.getCanvas().addEventListener('blocklyWorkspaceChange', this.pushSnapshot.bind(this));

};

UndoManager.prototype.stop = function(){
  Blockly.mainWorkspace.getCanvas().removeEventListener('blocklyWorkspaceChange', this.pushSnapshot.bind(this));
  // clearInterval(this.timer);
}

UndoManager.prototype.pushSnapshot = function(){
  if(this.stack.length >= UNDO_MAX_SIZE)
    return;

  var curXml = _xml();

  if(this.stack.length == 0 || curXml != this.stack[this.stack.length-1]){
    console.log('snapshot pushed');
    // console.log('cur: '+curXml+' , was:'+this.stack[this.stack.length-1]);
    this.stack.push(curXml);
    this.stack.slice(0, UNDO_MAX_SIZE);
  }else{
    // console.log('no snapshot pushed - equal');
  }



};

UndoManager.prototype.undo = function(){
  if(this.stack.length < 2)
    return;

  this.stop();
  this.stack.pop(); // pop current
  var dom = Blockly.Xml.textToDom(this.stack.pop())
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);

  this.start();


};





var app = angular.module('centoAuthoring');

app.service('blocksStore', function($http, $q){


  this.setParam = function(k, v){
    // var dfd = $q.defer();
    // localStorage.setItem(k, JSON.stringify(v));
    // dfd.resolve(true);
    // return dfd.promise;
    return $http.post('/api/param/'+k, {data: v}).then(function(res){
      return res.data;
    });
  }
  this.getParam = function(k){
    // var dfd = $q.defer();
    // var v = localStorage.getItem(k);
    // dfd.resolve(JSON.parse(v));
    // return dfd.promise;
    

    return $http.get('/api/param/'+k).then(function(res){
      if(res.data.data){
        return res.data.data;
      }
      return null;
    });
  }
  this.publish = function(topic){
    return $http.post('/api/publish', {topic: topic}).then(function(res){
      return res.data;
    });
  }

  this.loadRapp = function(){
    var that = this;
    var data = {};
    return $http.post('/api/load_rapp', data).then(function(res){
      return res.data;
    });
  };
  this.loadInteractions = function(){
    var that = this;
    var data = {};
    return $http.get('/api/load_interactions', data).then(function(res){
      return res.data;
    });
  };
  this.eval = function(code){
    var that = this;
    var data = {code: code};
    $http.post('/api/eval', data).then(function(res){
      return res.data;
    });
  };


});


app.service('serviceAuthoring', function($http, $q){

  this.saveService = function(serviceMeta, package){
    return $http.post('/api/services/save', {service: serviceMeta, package: package}).then(function(res){
      return res.data;
    });

  };

  this.getPackages = function(serviceMeta){
    return $http.get('/api/packages').then(function(res){
      return res.data;
    });

  };

});





var app = angular.module('centoAuthoring');
app.controller('ConfigCtrl', function($scope, blocksStore, $http) {
  console.log('x');

    $scope.blockConfigs = {};
    $scope.currentBlockConfig = '';

    var editor = $scope.editor = new JSONEditor($('#config-editor').get(0), {
      disable_array_reorder: true,
      disable_collapse: true,
      disable_edit_json: true,
      disable_properties: true,
      schema: {
        title: 'blockconfig',
        type: "object",
        properties: {
          rapp: {type: 'string'},
          uri: {type: 'string'},
          timeout: {
            type: 'integer',
            default: 15000
          },
          remappings: { 
            type: 'array',
            format: 'table',
            title: 'Remappings',
            items: {
              type: 'object',
              properties: {
                remap_from: {type: 'string'},
                remap_to: {type: 'string'}
              }

            }
          },
          parameters: { 
            type: 'array',
            format: 'table',
            title: 'Parameters',
            items: {
              type: 'object',
              properties: {
                key: {type: 'string'},
                value: {type: 'string'}
              }

            }
          },
        }
      }
      
    });
    var default_value = editor.getValue();
    window.editor = editor;

    editor.on('change', function(){
      if(Blockly.selected){
        Blockly.selected.extra_config = editor.getValue();
      };
    });

    Blockly.mainWorkspace.getCanvas().addEventListener('blocklySelectChange', function(){
      editor.setValue(default_value);
      console.log("DEF", default_value);


      if(Blockly.selected){
        var cfg = Blockly.selected.extra_config;


        if(cfg){
          editor.setValue(R.mixin(default_value, cfg));
          console.log(editor.getValue(), "---------");


        }else{
          // var v = editor.getValue()
          // v.remappings = [];
          editor.setValue(default_value);
          // editor.setValue({remappings: []});
        }
      }

    });


});


var app = angular.module('centoAuthoring');
app.controller('RootCtrl', function($scope, blocksStore, $http) {
  $scope.services = [];

  blocksStore.getParam(SERVICES_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.services = $scope.recents = [];
    }else{
      $scope.services = rows;
      // $scope.recents = R.take(5, R.sort(function(a, b){ return b.id - a.id; }, rows));
    }
    $scope.$watch('services', function(newValue, oldValue) {
      console.log('services watched');
      if (!_.isEqual(newValue, oldValue)) {
        console.log(oldValue, "->", newValue);

        blocksStore.setParam(SERVICES_PARAM_KEY, newValue).then(function(res){
          console.log('services saved', newValue, res);

        });
          
      }
    }, true);
  });

  $scope.searchCompare = function(v, keyword){ 
    return v.toString().toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
  };

});


var _interaction_to_json_editor_value = function(i){
  var kv = {
    display_name: i.defaults.display_name, 
    name: i.defaults.display_name, 
    description: i.defaults.description,
    compatibility: i.compatibility,
    max: -1,
    role: 'Role', 

  };

  kv.remappings = R.map(function(if0){
    return {
      remap_to: if0.name,
      remap_from: "/"+if0.name
    };
  })(i.interface);

  console.log(kv.remappings);


  kv.parameters = R.map(function(p){
    return {
      key: p.name, 
      value: (p.default || '')
    };
  })(i.parameters);
  return kv;

};



var schema = {
  title: "Create Service",
  type: "object",
  properties: {
    id: {
      type: 'string',
      options: {
        hidden: true
      }

    },
    created_at: {
      type: 'integer',
      options: {
        hidden: true
      }

    },

    name: {
      type: 'string',
      title: 'Name'

    },
    description: {
      type: 'string',
      title: 'Description'
    },
    author: {
      type: 'string',
      title: 'Author'

    },
    priority: {
      type: 'integer',
      default: 10000,
      title: 'Priority'
    },
    // icon: {
      // type: 'string',
      // format: 'url',
      // title: 'Icon',
      // options: {
        // upload2: true
      // },
      // // links: [
        // // {href: '{{self}}'}
      // // ]

    // },
    launcher: {
      type: 'object',
      properties: {
        launcher_type: {
          type: 'string',
          enum: [
            'ros_launcher',
            'bpel',
            'blockly'
          ]

        },
        launcher_body: {
          type: 'string',
          format: 'textarea'
        },


      }

    },
    workflows: {
      "type": "array",
      "uniqueItems": true,
      format: 'checkbox',
      "items": {
        "type": "string",
        "enum": ["value1","value2"]
      }
    },
    interactions: {
      type: 'array',
      title: 'Interactions',
      options: {
        disable_array_add: true,
        collapsed: false

      },
      items: {
        type: 'object',
        title: 'Interaction',
        headerTemplate: "{{self.display_name}}",
        properties: {
          name: {type: 'string'},
          role: {type: 'string'},
          compatibility: {
            type: 'string', 
            options: {
              hidden: true
            }
          },
          description: {
            type: 'string',
            format: 'textarea'
          },
          max: {
            type: 'integer', 
            default: -1
          },
          display_name: {
            type: 'string', 
            options: {
              hidden: true
            }
          },
          remappings: {
            type: 'array',
            format: 'table',
            title: 'Remappings',
            options: {
            },
            items: {
              type: 'object',
              properties: {
                remap_from: {type: 'string'},
                remap_to: {type: 'string'}
              }

            }

          },
          parameters: {
            type: 'array',
            format: 'table',
            title: 'Parameters',
            options: {
              disable_array_delete: true

            },
            items: {
              type: 'object',
              properties: {
                key: {type: 'string'},
                value: {type: 'string'}
              }

            }

          }
        }

      },

      properties: {
        role: {
          title: 'Role',
          type: 'string'

        }

      }
    },
    parameters: {
      type: 'array',
      format: 'table',
      title: 'Parameters',
      options: {
        disable_array_delete: true

      },
      items: {
        type: 'object',
        properties: {
          key: {type: 'string'},
          value: {type: 'string'}
        }

      }
    },
  }
}


JSONEditor.defaults.options.upload = function(type, file, cbs) {
  console.log("UPLOAD HANDLER", arguments);


  var fr = new FileReader();
  fr.onload = function(e) {
    var base64 = e.target.result;
    cbs.success(base64);
  };       
  fr.readAsDataURL(file);

  if (type === 'root.upload_fail') cbs.failure('Upload failed');
  else {
    var tick = 0;
    var tickFunction = function() {
      tick += 1;
      console.log('progress: ' + tick);
      if (tick < 100) {
        cbs.updateProgress(tick);
        window.setTimeout(tickFunction, 50)
      } else if (tick == 100) {
        cbs.updateProgress();
        window.setTimeout(tickFunction, 500)
      } else {
        // cbs.success('http://www.example.com/images/' + file.name);
      }
    };
    window.setTimeout(tickFunction)
  }
};

// Editor for uploading files
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && schema.options && schema.options.upload2 === true) {
    if(window.FileReader) return "upload2";
  }
});

JSONEditor.defaults.editors.upload2 = JSONEditor.AbstractEditor.extend({
  getNumColumns: function() {
    return 4;
  },
  build: function() {    
    var self = this;
    this.title = this.header = this.label = this.theme.getFormInputLabel(this.getTitle());

    // Input that holds the base64 string
    this.input = this.theme.getFormInputField('hidden');
    this.container.appendChild(this.input);
    
    // Don't show uploader if this is readonly
    if(!this.schema.readOnly && !this.schema.readonly) {

      if(!this.jsoneditor.options.upload) throw "Upload handler required for upload editor";

      // File uploader
      this.uploader = this.theme.getFormInputField('file');
      
      this.uploader.addEventListener('change',function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if(this.files && this.files.length) {
          var fr = new FileReader();
          fr.onload = function(evt) {
            self.setValue(evt.target.result);
            self.onChange(true);
            fr = null;
          };
          fr.readAsDataURL(this.files[0]);
        }
      });
    }

    var description = this.schema.description;
    if (!description) description = '';

    // this.preview = this.theme.getFormInputDescription(description);
    // this.container.appendChild(this.preview);

    this.control = this.theme.getFormControl(this.label, this.uploader||this.input, this.preview);
    this.container.appendChild(this.control);
  },
  enable: function() {
    if(this.uploader) this.uploader.disabled = false;
    this._super();
  },
  disable: function() {
    if(this.uploader) this.uploader.disabled = true;
    this._super();
  },
  setValue: function(val) {
    if(this.value !== val) {
      this.value = val;
      this.input.value = this.value;
      this.onChange();
    }
  },
  destroy: function() {
    if(this.preview && this.preview.parentNode) this.preview.parentNode.removeChild(this.preview);
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    if(this.uploader && this.uploader.parentNode) this.uploader.parentNode.removeChild(this.uploader);

    this._super();
  }
});


var app = angular.module('centoAuthoring');
app.controller('ServiceFormCtrl', function($scope, blocksStore, $http, serviceAuthoring, $stateParams) {
   $scope.select2Options = {
     allowClear:true
   };



  // $scope.blockConfigs = {};
  // $scope.currentBlockConfig = '';
  $scope.destPackage = null;
  blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
    blocksStore.loadInteractions().then(function(interactions){

      console.log('here');



      var titles = R.pluck('title')(rows);
      console.log(titles);
      schema.properties.workflows.items.enum = titles;

      var editor = window.editor =$scope.editor = new JSONEditor($('#service-editor').get(0), {
        disable_array_reorder: true,
        disable_collapse: true,
        disable_edit_json: true,
        disable_properties: true,
        schema: schema      
      });


      var form_v = editor.getValue();
      if($stateParams.service_id){
        var vv = R.find(R.propEq('id', $stateParams.service_id))($scope.services);
        form_v = vv;

      }
      if($stateParams.new_name){
        form_v.name = $stateParams.new_name;
      }
      editor.setValue(form_v);
      var e0 = editor.getEditor('root.parameters');


      
      var selected_workflows = 0;

      
      editor.on('change', function(){
        var cur = editor.getValue();
        var curlen = cur.workflows.length;
        if(selected_workflows !== curlen){
          console.log('...');

          // do
          var rows_selected = R.filter(function(row){
            return R.indexOf(row.title, cur.workflows) >= 0;
          })(rows);
          // var rows_selected = R.filter( R.combine(R.flip(R.contains)(cur.workflows), R.prop('title')) )(rows);
// R.useWith(R.filter, R.flip(R.contains), R.prop('title'))(cur.workflows, rows);



          console.log("ROWS", rows_selected);

          if(rows_selected.length == 0){
            var v = editor.getValue();
            v.interactions = [];
            editor.setValue(v);
          }


          R.map(function(rs){
            var xml = rs.xml;
            var extras = $(xml).find('mutation[extra]').map(function(){
              return $(this).attr('extra');  
            }).toArray();

            extras = R.map(function(x){ console.log(x);
             return JSON.parse(x); }, extras);


            client_app_ids = R.uniq(R.pluck('client_app_id', extras));
            console.log(client_app_ids);
            console.log(interactions);


            var used_interactions = R.filter(function(d){ return R.indexOf(d._id, client_app_ids) >= 0; })(interactions.data);
            console.log(used_interactions);

            var v = editor.getValue();
            v.interactions = R.map(_interaction_to_json_editor_value)(used_interactions);
            editor.setValue(v);




            
          })(rows_selected);




          selected_workflows = curlen;
        };
      });

    });



  });

  serviceAuthoring.getPackages().then(function(packs){
    $scope.packageList = packs;
  });

  $scope.exportOk = function(){
    var v = editor.getValue();
    console.log($scope.destPackage);

    serviceAuthoring.saveService(v, $scope.destPackage).then(function(){
      alert('saved');
      $('#modal-package-select').modal('hide');
      
    });

  };
  $scope.export = function(){
    serviceAuthoring.getPackages().then(function(packs){
      // $scope.packageList = packs;

      // var v = editor.getValue();
      // serviceAuthoring.saveService(v);

      $('#modal-package-select').modal();

    });


  };
  $scope.save = function(){
    console.log('save');

    var v = editor.getValue();

    console.log("save data : ", v);

    if(v.id){
      console.log($scope.services);

      var idx = -1;
      for(var i = 0; i<$scope.services.length; i++){
        if($scope.services[i].id == v.id){
          idx = i;
          break;
        }

      }
      if(idx >= 0){
        console.log('x');

         $scope.services[idx] = v;

      }



    }else{
      v.id = _uuid();
      v.created_at = new Date().getTime();
      $scope.services.push(v);
    }
    


    // serviceAuthoring.saveService(v, $scope.destPackage[0].name).then(function(){
      // alert('saved');
      
    // });
    $('#modal-package-select').modal('hide');


  };


});


var app = angular.module('centoAuthoring');
app.controller('ServicesIndexCtrl', function($scope, blocksStore) {
});


var app = angular.module('centoAuthoring');
app.controller('WorkflowBlocklyCtrl', function($scope, blocksStore, $http, $rootScope, $stateParams) {

  var items;
  $scope.foo = 'bar';

  $scope.itemSelection = [];
  $scope.rapp_url = "http://files.yujinrobot.com/rocon/rapp_repository/office_rapp.tar.gz";
  items = $scope.items = []
  $scope.robot_brain = {};

  var resetCurrent = function(){
    $scope.current = {id: new Date().getTime() + "", title: 'Untitled', description: 'Service Description'};
  };
  resetCurrent();
  if($stateParams.new_name){
    $scope.current.title = $stateParams.new_name;
  }


  var setupEditable = function(re){
    $('#description, #title').editable('destroy');

    $('#title').editable({
      display: function(){
        $(this).html($scope.current.title);
      },
      value: $scope.current.title,
      success: function(res, newv){
        $scope.current.title = newv;
      }
    });
    $('#description').editable({
      display: function(){
        $(this).html($scope.current.description);
      },
      value: $scope.current.description,
      success: function(res, newv){
        $scope.current.description = newv;
      }
    });

  };

  $rootScope.$on('$viewContentLoaded', function() {
    setupEditable();
  });

  blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.items = [];
    }else{
      $scope.items = rows;
      reload_udf_blocks($scope.items);

    }

    $scope.$watch('items', function(newValue, oldValue) {
      console.log('items watched');
      if (!_.isEqual(newValue, oldValue)) {
        console.log(oldValue, "->", newValue);

        blocksStore.setParam(ITEMS_PARAM_KEY, newValue).then(function(res){
          reload_udf_blocks($scope.items);
          console.log('items saved', newValue, res);

        });
          
      }
    }, true);
    if($stateParams.id){ // load
      $scope.load($stateParams.id);

    }

  });
  $scope.save = function() {


    var id = $scope.current.id;
    var title = $scope.current.title;
    var description = $scope.current.description;
    var js = _js();
    var xml = _xml();


    var idx = _.findIndex($scope.items, {id: id});
    if(idx >= 0){
      $scope.items[idx] = {id: id, js: js, xml: xml, title: $scope.current.title, description: description};
      console.log(1);


    }
    else {
      
      $scope.items.push({id: id, title: title, js: js, xml: xml, description: description});
      console.log(2);

    }
  };




    var loadBlocks = function(url){
      var $tb = $('#toolbox');
      var generator = new BlockGenerator();
      
      blocksStore.loadRapp(url)
        .catch(function(e){
          console.log('cannot load blocks - msg database error');

        })
        .then(function(x){
          console.groupCollapsed("Rapp Blocks");

          generator.generate_message_blocks(x.types);

          R.mapObj.idx(function(subTypes, k){
            var $el = generator.message_block_dom(k, subTypes);
          })(x.types);

          /*
           * Rapp blocks
           */
          _.each(x.rapps, function(rapp){
            _.each(rapp.rocon_apps, function(rocon_app, key){
              var meta = rocon_app.interfaces;
              _.each(meta.action_servers, function(sub){

                var $b = generator.scheduled_action_block_dom(
                  [rapp.name, key].join("/"),
                  "rocon:/pc",
                  sub.name,
                  sub.type);
                $tb.find('category[name=ROS]').append($b);

              });
              _.each(meta.publishers, function(sub){

                var $b = generator.scheduled_subscribe_block_dom(
                  [rapp.name, key].join("/"),
                  "rocon:/pc",
                  sub.name,
                  sub.type);
                $tb.find('category[name=ROS]').append($b);

              });

              _.each(meta.subscribers, function(sub){

                var $b = generator.scheduled_publish_block_dom(
                  [rapp.name, key].join("/"),
                  "rocon:/pc",
                  sub.name,
                  sub.type);
                $tb.find('category[name=ROS]').append($b);

              });

            });

          });
          console.groupEnd();


          console.log($('#toolbox').get(0));

          return blocksStore.loadInteractions();


        })
        .then(function(interactions){
        
          console.groupCollapsed('Load interactions');
          console.log(interactions);



          var sub_topics_el = R.compose(
            R.map(function($el){ $tb.find('category[name=ROS]').append($el); }),
            R.map(R.bind(generator.subscribe_block_dom, generator)),
            R.reject(R.isEmpty),
            R.flatten,
            R.mapProp('interface'),
            R.map(function(i){ i.interface = R.map(R.assoc('client_app_id', i._id))(i.interface); return i;})
          )(interactions.data);
          


          console.groupEnd();

          // IMPORTANT
          ros_block_override();


          Blockly.updateToolbox($('#toolbox').get(0));
        });;

    };
  _.defer(loadBlocks);


  $scope.engineLoadChecked = function(){
    var items = $scope.itemSelection;
    console.log(items);

    if(items.length < 1){
      alert('select items to load.');
    }else{
      $http.post('/api/engine/load', {blocks: $scope.itemSelection}).then(function(){
        alert('ok');
      });
    }

  };
  $scope.engineReset = function(){
    $http.post('/api/engine/reset').then(function(){
      alert('ok');
    });

  };

  /**
   * workspace
   *
   */
  $scope.clearWorkspace = function() {
    Blockly.mainWorkspace.clear();
  };

  // $scope.runCurrent = function() {
    // var code;
    // code = Blockly.JavaScript.workspaceToCode();
    // console.log(code);
    // blocksStore.eval(code);

  // };

  $scope.deleteItem = function(id) {
    $scope.items = _.reject($scope.items, {id: id})
    $scope.current = null;
  };

  $scope.newData = function() {
    Blockly.mainWorkspace.clear();
    resetCurrent();
    setupEditable();

  };
  $scope.load = function(id) {

    var data = R.find(R.propEq('id', id))($scope.items);
    $scope.current = data;
    setupEditable(true);
    console.log(data);


    dom = Blockly.Xml.textToDom(data.xml);
    Blockly.mainWorkspace.clear();

    try{
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, dom);
    }catch(e){
      alert('failed to load blocks - '+e.toString());

    }
  };





  /**
   * items checkbox
   */
  $scope.toggleItemSelection = function(id){

    _.include($scope.itemSelection, id) ?
      _.pull($scope.itemSelection, id) :
      $scope.itemSelection.push(id)

  };


  $scope.exportItems = function(){
    var pom = document.createElement('a');
    R.map(function(id){
      var item = R.find(R.propEq('id', id))($scope.items);


      console.log('data:application/json;charset=utf-8,' + JSON.stringify(item));
      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(item))
      pom.setAttribute('download', item.title + ".json");
      pom.click();

    })($scope.itemSelection);

    _.times(2, function(){
    });

  };
  $scope.importItems = function(){
    $('#itemsFile').click()
  };
  $scope.itemsFileNameChanged = function(e){
    var files = e.files;
    var f = files[0];

    var r = new FileReader();
    r.onload = function(e) { 
      var json = e.target.result;
      var item = JSON.parse(json);

      $scope.$apply(function(){
        item.id = new Date().getTime().toString();
        $scope.items.push(item);

      });

      console.log($scope.items);




    }
    r.readAsText(f);




  };
});



var app = angular.module('centoAuthoring');
app.controller('WorkflowIndexCtrl', function($scope, blocksStore) {
  $scope.items = [];
  $scope.recents = [];
  blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.items = $scope.recents = [];
    }else{
      $scope.items = rows;
      $scope.recents = R.take(5, R.sort(function(a, b){ return b.id - a.id; }, rows));
    }
  });
});