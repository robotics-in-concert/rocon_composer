
app.service('serviceAuthoring', function($http, $q){

  this.saveService = function(serviceMeta, package){
    return $http.post('/api/services/save', {service: serviceMeta, package: package}).then(function(res){
      return res.data;
    });

  };

  this.getPackages = function(serviceMeta){
    return $http.get('/api/packages').then(function(res){
      return res.data;
    });

  };

});



