
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
app.controller('ServiceFormCtrl', function($scope, blocksStore, $http, serviceAuthoring, $stateParams, $state) {
   $scope.select2Options = {
     allowClear:true
   };


   $http.get('/js/schema/service_form.json').success(function(schema){

     // $scope.blockConfigs = {};
     // $scope.currentBlockConfig = '';
     $scope.destPackage = null;
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
           schema: schema,
           ajax: true

         });

         editor.on('ready', function(){
           console.log('ready');


         });


         var form_v = editor.getValue();
         if($stateParams.service_id){
           var vv = R.find(R.propEq('id', $stateParams.service_id))($scope.services);
           form_v = vv;

         }
         if($stateParams.new_name){
           form_v.name = $stateParams.new_name;
         }
         editor.setValue(form_v);
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



  serviceAuthoring.getPackages().then(function(packs){
    $scope.packageList = packs;
  });

  $scope.exportOk = function(){
    var v = editor.getValue();
    console.log($scope.destPackage);

    serviceAuthoring.saveService(v, $scope.destPackage).then(function(){
      alert('saved');
      $('#modal-package-select').modal('hide');
      
    });

  };
  $scope.export = function(){
    serviceAuthoring.getPackages().then(function(packs){
      // $scope.packageList = packs;

      // var v = editor.getValue();
      // serviceAuthoring.saveService(v);

      $('#modal-package-select').modal();

    });


  };
  $scope.save = function(){
    console.log('save');

    var v = editor.getValue();

    console.log("save data : ", v);

    if(v.id){
      console.log($scope.services);

      var idx = -1;
      for(var i = 0; i<$scope.services.length; i++){
        if($scope.services[i].id == v.id){
          idx = i;
          break;
        }

      }
      if(idx >= 0){
        console.log('x');

         $scope.services[idx] = v;

      }



    }else{
      v.id = _uuid();
      v.created_at = new Date().getTime();
      $scope.services.push(v);
      $state.go('services_edit', {service_id: v.id});

      
    }
    


    // serviceAuthoring.saveService(v, $scope.destPackage[0].name).then(function(){
      // alert('saved');
      
    // });
    $('#modal-package-select').modal('hide');


  };


});
