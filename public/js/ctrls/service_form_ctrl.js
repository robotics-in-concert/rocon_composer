
var app = angular.module('centoAuthoring');
app.controller('ServiceFormCtrl', function($scope, blocksStore, $http) {
    // $scope.blockConfigs = {};
    // $scope.currentBlockConfig = '';

    var editor = $scope.editor = new JSONEditor($('#service-editor').get(0), {
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
          interactions: {
            type: 'array',
            title: 'Interactions',
            options: {
              disable_array_add: false

            },
            items: {
              type: 'object',
              title: 'Interaction',
              properties: {
                key: {type: 'string'},
                value: {type: 'string'}
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
    var e0 = editor.getEditor('root.parameters');

    editor.on('change', function(){
    });


});
