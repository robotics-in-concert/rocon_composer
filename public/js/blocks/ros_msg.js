var msg_registered = [];
Blockly.register_message_block = function(type, meta){
  if(!_.include(msg_registered, type)){
    var blockKey = "ros_msg_" + type.replace("/", "-");
    Blockly.Blocks[blockKey] = {
      init: function() {
        var block = this;
        this.setColour(77);
        //
        this.appendDummyInput().appendField('[ROS] msg '+type);
        _.each(meta.fieldnames, function(fn, idx){
          block.appendValueInput(fn.toUpperCase()).appendField(fn);

        });
        this.setOutput(true);

        this.setPreviousStatement(false);
        return this.setNextStatement(false);
      }
    };


    msg_registered.push(type);

  // Blockly.JavaScript[blockKey] = function(block) {
    // var msg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "''";
    // var tpl = '$engine.pub("<%= name %>", "<%= type %>", <%= msg %>);';
    // return _.template(tpl)({name: name, type: type, msg: msg});
  // };
  }

};

