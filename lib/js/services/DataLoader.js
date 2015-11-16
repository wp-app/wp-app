module.exports = function($http) {
  'ngInject';

  return {
    all: function(url) {
      return $http.jsonp( url );
    },
    get: function(url) {
      // Simple index lookup
      return $http.get( url );
    },
    getAuth: function(base64, url) {
      
      $http.defaults.headers.common['Authorization'] = 'Basic ' + base64;

      var req = { method: 'GET', url: url }

      return $http( req );
    },
    put: function(base64, url, options) {
      
      $http.defaults.headers.common['Authorization'] = 'Basic ' + base64;

      var req = { 
        method: 'PUT', 
        url: url,
        data: options 
      }

      return $http( req );
    },
    delete: function(base64, url) {

      $http.defaults.headers.common['Authorization'] = 'Basic ' + base64;

      var req = {
       method: 'DELETE',
       url: url
      }
      return $http( req );
    },
  }

}