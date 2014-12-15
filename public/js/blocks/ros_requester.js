
Blockly.Blocks['ros_requester_allocate'] = {
  configable: true,
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("Allocate Resource");
    this.appendStatementInput('DO')
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['ros_requester_allocate'] = function(block){
  // return "requester.cancel_all();";
  var config = block.extra_config;

  var codeOnAllocated = Blockly.JavaScript.statementToCode(block, 'DO');

  var remapping_kv = R.compose(
    R.fromPairs,
    R.map(R.values)
  )(config.remappings);

  var tpl = '$engine.allocateResource("<%= rapp %>", "<%= uri %>", <%= remappings %>, <%= parameters %>, <%= required_topics %>, function(requester){ <%= code %> }); ';

  tpl = "(function(){ var remappings = <%= remapping_kv %>; " + tpl + " })();"

  var code = _.template(tpl)({
    rapp: config.rapp, 
    uri: config.uri, 
    remapping_kv: JSON.stringify(remapping_kv),
    remappings: JSON.stringify(config.remappings),
    required_topics: JSON.stringify(config.required_topics),
    parameters: JSON.stringify(config.parameters),
    code: codeOnAllocated
  });
  return code;

};




Blockly.Blocks['ros_requester_release'] = {
  init: function() {
    var block = this;
    this.setColour(77);
    this.appendDummyInput().appendField("release resources");
    this.setPreviousStatement(true);
    return this.setNextStatement(true);
  }
};
Blockly.JavaScript['ros_requester_release'] = function(block){
  return "requester.cancel_all();";

};


