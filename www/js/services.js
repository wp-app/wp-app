angular.module('wpApp.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('DataLoader', function( $http ) {

  return {
    all: function(url) {
      return $http.jsonp( url );
    },
    get: function(url) {
      // Simple index lookup
      return $http.jsonp( url );
    },
    getAuth: function(user, pass, url) {
      // None of this auth stuff works yet
      var req = {
       method: 'GET',
       url: url,
       headers: {
         'Authorization': 'Basic ' + btoa( 'user:pass' )
       }
      }
      return $http.jsonp( req );
    },
    delete: function(user, pass, url) {
      $http.defaults.headers.common['Authorization'] = 'Basic ' + btoa( user + ':' + pass );
      var req = {
       method: 'DELETE',
       url: url
      }
      return $http.jsonp( req );
    },
  }

})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);