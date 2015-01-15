var _ = require('lodash'),
  R = require('ramda'),
  $ = require('jquery'),
  Blockly = require('blockly');

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
  console.log('udf reloaded');

};


module.exports = {
  reload_udf_blocks: reload_udf_blocks,
  xml: _xml,
  js: _js,
  uuid: _uuid

};
