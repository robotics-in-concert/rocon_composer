
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

