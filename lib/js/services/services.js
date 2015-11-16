module.exports = angular.module('wpapp.services', [
    'pascalprecht.translate',
    'wpapp.constants',
  ])
  .factory('CacheImg', require('./ImgCache.js'))
  .factory('Modal', require('./Modal.js'))
  .factory('DataLoader', require('./DataLoader.js'))
  .factory('SitesDB', require('./SitesDB.js'))
  .factory('Base64', require('./Base64.js'));

require('./Language.js');
