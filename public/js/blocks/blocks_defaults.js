

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
          var $scope = angular.element('#blockly-page').scope();
          $scope.modalBlockConfig();
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

