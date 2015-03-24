
var mongoose = require('mongoose');



var settingsSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed
});
settingsSchema.statics.getItems = function(cb){
  this.findOne({key: 'cento_authoring_items'}, function(e, row){
    if(e){ cb(e); }
    else{ cb(null, row.value.data); }
  });

};



module.exports = {
  Settings: mongoose.model('settings', settingsSchema)
}
