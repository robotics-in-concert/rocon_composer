
angular.module('centoAuthoring')
  .provider('caJsonEditor', CAJsonEditorProvider)
  .directive('caJsonEditor', CAJsonEditor);

function CAJsonEditorProvider(){
  this.$get = function($window){
    return $window.JSONEditor;
  };

};

CAJsonEditor.$inject = ['$q', 'caJsonEditor'];

function CAJsonEditor($q, JSONEditor){
  return {
    restrict: 'E',
    scope: {
      schema: '=',
      editorOptions: '=',
      startval: '=',
      onChange: '&'
    },
    link: function(scope, element, attrs){
      var valueToResolve,
          startValPromise = $q.when(null),
          schemaPromise = $q.when(null);

      scope.isValid = false;

      console.log('ATTRS', attrs);


      if (!angular.isString(attrs.schema)) {
          throw new Error('no schema specified');
      }
      if (angular.isObject(scope.schema)) {
          schemaPromise = $q.when(scope.schema);
      }
      if (angular.isObject(scope.startval)) {
          valueToResolve = scope.startval;
          if (angular.isDefined(valueToResolve.$promise)) {
              startValPromise = $q.when(valueToResolve.$promise);
          } else {
              startValPromise = $q.when(valueToResolve);
          }
      }

      $q.all([schemaPromise, startValPromise]).then(function (result) {

        var schema = result[0].data || result[0],
            startVal = result[1];
        if (schema === null) {
            throw new Error('no schema');
        }

        console.log('schema : ', schema);


        var options = {schema: schema};
        if(startVal){ options.startval = startVal; }


        options = R.mixin(options, scope.editorOptions);
        scope.editor = new JSONEditor(element[0], options);

        var editor = scope.editor;

        editor.on('ready', function () {
          scope.isValid = (editor.validate().length === 0);
        });

        editor.on('change', function () {
          if (typeof scope.onChange === 'function') {
            console.log('---', editor.getValue());

              scope.onChange({data: editor.getValue()});
          }
          scope.$apply(function () {
              scope.isValid = (editor.validate().length === 0);
          });
        });

      });

    }

  }

}
