
var _interaction_to_json_editor_value = function(i){
  var kv = {
    display_name: i.defaults.display_name, 
    name: i.defaults.display_name, 
    description: i.defaults.description,
    compatibility: i.compatibility,
    max: -1,
    role: 'Role', 

  };

  kv.remappings = R.map(function(if0){
    return {
      remap_to: if0.name,
      remap_from: "/"+if0.name
    };
  })(i.interface);

  console.log(kv.remappings);


  kv.parameters = R.map(function(p){
    return {
      key: p.name, 
      value: (p.default || '')
    };
  })(i.parameters);
  return kv;

};




var app = angular.module('centoAuthoring');
app.controller('ServiceFormCtrl', function($scope, blocksStore, $http, serviceAuthoring) {
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
    var schema = {
      title: "Service",
      type: "object",
      properties: {

        name: {
          type: 'string',
          title: 'Name'

        },
        description: {
          type: 'string',
          title: 'Description'
        },
        author: {
          type: 'string',
          title: 'Author'

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
          format: 'checkbox',
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
            collapsed: false

          },
          items: {
            type: 'object',
            title: 'Interaction',
            headerTemplate: "{{self.display_name}}",
            properties: {
              name: {type: 'string'},
              role: {type: 'string'},
              compatibility: {
                type: 'string', 
                options: {
                  hidden: true
                }
              },
              description: {
                type: 'string',
                format: 'textarea'
              },
              max: {
                type: 'integer', 
                default: -1
              },
              display_name: {
                type: 'string', 
                options: {
                  hidden: true
                }
              },
              remappings: {
                type: 'array',
                format: 'table',
                title: 'Remappings',
                options: {
                },
                items: {
                  type: 'object',
                  properties: {
                    remap_from: {type: 'string'},
                    remap_to: {type: 'string'}
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



    $scope.export = function(){
      serviceAuthoring.getPackages().then(function(packs){
        $scope.packageList = packs;
        // var v = editor.getValue();
        // serviceAuthoring.saveService(v);

        $('#modal-package-select').modal();

      });


    };
    $scope.save = function(){
      console.log('save');
      var v = editor.getValue();

      serviceAuthoring.saveService(v, $scope.destPackage[0].name).then(function(){
        alert('saved');
        
      });
      $('#modal-package-select').modal('hide');


    };
    blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
      blocksStore.loadInteractions().then(function(interactions){


        var titles = R.pluck('title')(rows);
        console.log(titles);
        schema.properties.workflows.items.enum = titles;

        var editor = window.editor =$scope.editor = new JSONEditor($('#service-editor').get(0), {
          disable_array_reorder: true,
          disable_collapse: true,
          disable_edit_json: true,
          disable_properties: true,
          schema: schema      
        });
        var v = editor.getValue();
        v.parameters.push({key: 'key1', value: 'value1'});
        v.parameters.push({key: 'key2', value: 'value2'});
        v.parameters.push({key: 'key3', value: 'value3'});

        editor.setValue(v);
        var e0 = editor.getEditor('root.parameters');


        
        var selected_workflows = 0;

        
        editor.on('change', function(){
          var cur = editor.getValue();
          var curlen = cur.workflows.length;
          if(selected_workflows !== curlen){
            console.log('...');

            // do
            var rows_selected = R.filter(function(row){
              return R.indexOf(row.title, cur.workflows) >= 0;
            })(rows);
            // var rows_selected = R.filter( R.combine(R.flip(R.contains)(cur.workflows), R.prop('title')) )(rows);
// R.useWith(R.filter, R.flip(R.contains), R.prop('title'))(cur.workflows, rows);



            console.log("ROWS", rows_selected);

            if(rows_selected.length == 0){
              var v = editor.getValue();
              v.interactions = [];
              editor.setValue(v);
            }


            R.map(function(rs){
              var xml = rs.xml;
              var extras = $(xml).find('mutation[extra]').map(function(){
                return $(this).attr('extra');  
              }).toArray();

              extras = R.map(function(x){ console.log(x);
               return JSON.parse(x); }, extras);


              client_app_ids = R.uniq(R.pluck('client_app_id', extras));
              console.log(client_app_ids);
              console.log(interactions);


              var used_interactions = R.filter(function(d){ return R.indexOf(d._id, client_app_ids) >= 0; })(interactions.data);
              console.log(used_interactions);

              var v = editor.getValue();
              v.interactions = R.map(_interaction_to_json_editor_value)(used_interactions);
              editor.setValue(v);




              
            })(rows_selected);




            selected_workflows = curlen;
          };
        });

      });



    });


});
