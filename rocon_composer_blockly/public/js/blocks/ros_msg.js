var Blockly = require('blockly');
var _ = require('lodash');

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
          var fvals = _.filter(meta.field_values, {name: fn});


          input = block.appendValueInput(fn.toUpperCase()).appendField(fn);
          if(fvals.length){
            var drops = _.map(fvals, function(fv){ return [fv.const, fv.value]; });
            drops.unshift(['Select..', '__'])
            var dd = new Blockly.FieldDropdown(drops);
            input.appendField(dd, 'SELECT_'+fn.toUpperCase());


          }

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
      var code = '';
      var kv = [];
      _.each(meta.fieldnames, function(fn, idx){
        var sel_val = block.getFieldValue('SELECT_' + fn.toUpperCase());
        var v = Blockly.JavaScript.valueToCode(block, fn.toUpperCase(), Blockly.JavaScript.ORDER_NONE) || "''";
        if(sel_val && sel_val != '__'){
          var value_type = _.zipObject(meta.fieldnames, meta.fieldtypes)[fn];
          v = (value_type == 'string') ? JSON.stringify(sel_val) : sel_val;
        }

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

