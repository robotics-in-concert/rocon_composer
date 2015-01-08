var BlockGenerator = function(){

  this.message_blocks = [];
  this.type_blocks = {};
  this.subscribe_blocks = [];
  this.publish_blocks = [];

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

  console.log('_buildBlockTree', lst, meta, parent);

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
    try {
      var $el = this._buildBlockTree(subTypes, subTypes[k]);
    }catch(e){
      console.error('failed to get message block dom', k);
    }
  }

  if($el){
    $el.attr('collapsed', true);
    this.type_blocks[k] = $el.get(0);
  }
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
BlockGenerator.prototype.generate_client_app_blocks = function(data){
  var interface = data.interface;
  var client_app_id = data.client_app_id;
  console.log("=========", interface, client_app_id);
  var that = this;

  var pubs = R.map(
    R.compose(
      R.bind(that.publish_block_dom, that),
      R.assoc('client_app_id', client_app_id)
    )
  )(interface.subscribers);
  var subs = R.map(
    R.compose(
      R.bind(that.subscribe_block_dom, that),
      R.assoc('client_app_id', client_app_id)
    )
  )(interface.publishers);
  // var subs = R.map(R.bind(that.subscribe_block_dom, that))(interface.publishers);
  // console.log(pubs.concat(subs));

  return pubs.concat(subs);
  // console.log(els);

  // return R.flatten(els);

};

BlockGenerator.prototype.publish_block_dom = function(opts){
  console.log('PUB OPT', opts);

  var name = opts.name;
  if(R.contains(name, this.publish_blocks)){
    return false;
  }
  var type = opts.type;

  var typeBlock = this.type_blocks[type];
  var $valueBlock = $('<value name="VALUE"></value>');
  $valueBlock.append($(typeBlock).clone());




  this.publish_blocks.push(name);
  Blockly.register_publish_block(name, opts.type, {client_app_id: opts.client_app_id});
  var $block = $('<block type="ros_publish_'+name+'"></block>');
  $block.append($valueBlock);
  return $block;


};
BlockGenerator.prototype.subscribe_block_dom = function(opts){
  console.log("X", opts);

  var name = opts.name;
  if(R.contains(name, this.subscribe_blocks)){
    return false;
  }
  this.subscribe_blocks.push(name);
  Blockly.register_subscribe_block(name, opts.type, {client_app_id: opts.client_app_id});
  var $block = $('<block type="ros_subscribe_'+name+'"></block>');
  return $block;


};
