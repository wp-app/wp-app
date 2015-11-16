module.exports = function($q, $log) {
  'ngInject';

  $log.debug('SitesDB service');

  var PouchDB = require('pouchdb/dist/pouchdb.min.js');
  
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
  }

  function initDB() {
    // Creates the database or opens if it already exists.
    _db = new PouchDB('sites');
  }

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

}