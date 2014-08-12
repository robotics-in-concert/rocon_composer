'use strict';

// goog.provide('Blockly.Blocks.test');

// goog.require('Blockly.Blocks');


Blockly.Blocks['test_log'] = {
  /**
   * Block for print statement.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl("http://google.com")
    this.setColour(160);
    this.interpolateMsg("console.log %1",
                        ['TEXT', null, Blockly.ALIGN_RIGHT],
                        Blockly.ALIGN_RIGHT);
    // this.interpolateMsg("log %1 and %2",
                        // ['TEXT', null, Blockly.ALIGN_RIGHT],
                        // ['TEXT', null, Blockly.ALIGN_RIGHT],
                        // Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("TOOLTIP");
  }
};

  // init: function() {
    // this.setHelpUrl(Blockly.Msg.TEXT_PRINT_HELPURL);
    // this.setColour(160);
    // this.interpolateMsg(Blockly.Msg.TEXT_PRINT_TITLE,
                        // ['TEXT', null, Blockly.ALIGN_RIGHT],
                        // Blockly.ALIGN_RIGHT);
    // this.setPreviousStatement(true);
    // this.setNextStatement(true);
    // this.setTooltip(Blockly.Msg.TEXT_PRINT_TOOLTIP);
  // }
Blockly.JavaScript['test_log'] = function(block) {
  // Print statement.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  return 'console.log(' + argument0 + ');\n';
};


$(function(){
  var getData = function(id){
    var s = localStorage.getItem('blockly_data');
    var data = JSON.parse(s);
    return _.where(data, {id: id})[0];


  };
  var appendData = function(d){
    var s = localStorage.getItem('blockly_data');
    var data = JSON.parse(s);

    if(!data){
      data = [];

    }
    data.push(d);
    localStorage.setItem('blockly_data', JSON.stringify(data));
  }

  var refresh = function(){
    var s = localStorage.getItem('blockly_data');
    var data = JSON.parse(s);
    window.data = data;
    $('#data li').remove();

    window.data.forEach(function(d){
      var li = $('<li>'+d.id+'</li>');
      li.data("id", d.id);
      $('#data').append(li);

    });

  };

  $('#save').click(function(){
    var js = Blockly.JavaScript.workspaceToCode();
    var dom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xml = Blockly.Xml.domToText(dom);

    appendData({id: new Date().getTime(), js: js, xml: xml});
    refresh();

  });
});
