angular.module('wpApp.services', [])

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
}])

.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZabcdef' +
            'ghijklmnopqrstuv' +
            'wxyz0123456789+/' +
            '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
})

.factory('DataLoader', function( $http ) {

  return {
    all: function(url) {
      return $http.jsonp( url );
    },
    get: function(url) {
      // Simple index lookup
      return $http.jsonp( url );
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
}])

.factory('SitesDB', ['$q', function( $q ) {
	
	var _db;
	var _sites;
	
	return {
		initDB: initDB,
		addSite: addSite,
		updateSite: updateSite,
		deleteSite: deleteSite,
		getAllSites: getAllSites,
		getSite: getSite,
		count: count,
	};
	
	function initDB() {
		// Creates the database or opens if it already exists.
		_db = new PouchDB('sites');
	};
	
	function addSite( site ) {
		return $q.when( _db.post( site ) );
	}
	
	function updateSite( site ) {
		return $q.when( _db.put( site ) );
	}
	
	function deleteSite( site ) {
		return $q.when( _db.remove( site ) );
	}
	
	function getAllSites() {
		if ( ! _sites ) {
			return $q.when( _db.allDocs({ include_docs: true }))
				.then( function( docs ) {
					
					// Map the array to contain just the doc objects.
					_sites = docs.rows.map( function( row ) {
						return row.doc;
					});
					
					// Listen for changes on the database.
					_db.changes({ live: true, since: 'now', include_docs: true })
						.on('change', onDatabaseChange);
					
					return _sites;
				});
		} else {
			// Return cached data as a promise
			return $q.when( _sites );
		}
	}
	
	function getSite( id ) {
		return $q.when( _db.get( id ) );
	}
	
	function count() {
		return $q.when( _db.info())
			.then( function( info ) {
				return info.doc_count;
			});
	}
	
	function onDatabaseChange( change ) {
		var index = findIndex( _sites, change.id );
		var site = _sites[ index ];
		
		if ( change.deleted ) {
			if ( site ) {
				_sites.splice( index, 1 ); // delete
			}
		} else {
			if ( site && site._id === change.id ) {
				_sites[ index ] = change.doc; // update
			} else {
				_sites.splice( index, 0, change.doc ) // insert
			}
		}
	}
	
	// Binary search, the array is by default sorted by _id.
	function findIndex( array, id ) {
		var low = 0, high = array.length, mid;
		while ( low < high ) {
			mid = ( low + high ) >>> 1;
			array[ mid ]._id < id ? low = mid + 1 : high = mid;
		}
		return low;
	}
	
}]);
