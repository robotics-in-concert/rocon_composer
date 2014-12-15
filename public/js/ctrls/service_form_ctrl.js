
var app = angular.module('centoAuthoring');
app.controller('ServiceFormCtrl', function($scope, blocksStore, $http) {
    // $scope.blockConfigs = {};
    // $scope.currentBlockConfig = '';

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

    var editor = window.editor =$scope.editor = new JSONEditor($('#service-editor').get(0), {
      disable_array_reorder: true,
      disable_collapse: true,
      disable_edit_json: true,
      disable_properties: true,
      schema: {
        title: "Service",
        type: "object",
        properties: {

          name: {
            type: 'string',
            title: 'Name'

          },
          description: {
            type: 'string',
            title: 'Description',
            format: 'textarea'
          },
          priority: {
            type: 'integer',
            default: 10000,
            title: 'Priority'
          },
          icon: {
            type: 'string',
            format: 'url',
            title: 'Icon',
            options: {
              upload2: true
            },
            // links: [
              // {href: '{{self}}'}
            // ]

          },
          launcher: {
            type: 'object',
            properties: {
              launcher_type: {
                type: 'string',
                enum: [
                  'ros_launcher'
                ]

              },
              launcher_body: {
                type: 'string',
                format: 'textarea'
              },


            }

          },
          workflows: {
            "type": "array",
            "uniqueItems": true,
            "items": {
              "type": "string",
              "enum": ["value1","value2"]
            }
          },
          interactions: {
            type: 'array',
            title: 'Interactions',
            options: {
              disable_array_add: true,
              disable_array_delete: true,
              collapsed: false

            },
            items: {
              type: 'object',
              title: 'Interaction',
              headerTemplate: "{{self.interaction_name}}",
              properties: {
                role: {type: 'string'},
                interaction_name: {
                  type: 'string', 
                  options: {
                    hidden: true
                  }
                },
                parameters: {
                  type: 'array',
                  format: 'table',
                  title: 'Parameters',
                  options: {
                    disable_array_delete: true

                  },
                  items: {
                    type: 'object',
                    properties: {
                      key: {type: 'string'},
                      value: {type: 'string'}
                    }

                  }

                }
              }

            },

            properties: {
              role: {
                title: 'Role',
                type: 'string'

              }

            }
          },
          parameters: {
            type: 'array',
            format: 'table',
            title: 'Parameters',
            options: {
              disable_array_delete: true

            },
            items: {
              type: 'object',
              properties: {
                key: {type: 'string'},
                value: {type: 'string'}
              }

            }
          },
        }
      }
      
    });
    var v = editor.getValue();
    v.interactions.push({interaction_name: 'IN', role: 'Role1', parameters: []});
    v.interactions.push({interaction_name: 'IN', role: 'Role1', parameters: []});
    v.interactions.push({interaction_name: 'IN', role: 'Role1', parameters: []});

    v.parameters.push({key: 'key1', value: 'value1'});
    v.parameters.push({key: 'key2', value: 'value2'});
    v.parameters.push({key: 'key3', value: 'value3'});

    editor.setValue(v);
    var e0 = editor.getEditor('root.parameters');

    editor.on('change', function(){
    });


});
