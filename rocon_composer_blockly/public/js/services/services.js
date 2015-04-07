
module.exports = function($http, $q){

  this.saveService = function(title, description, serviceMeta, package){
    return $http.post('/api/services/save', {service: serviceMeta, package: package, title: title, description: description})
      .then(function(res){
        return res.data;
      });

  };

  this.getPackages = function(serviceMeta){
    return $http.get('/api/packages').then(function(res){
      return res.data;
    });

  };

};



