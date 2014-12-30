
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

