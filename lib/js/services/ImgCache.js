module.exports = function($q, CONFIG, $log) {
  'ngInject';

  var initialised;
  initialised = false;
  return {
    init: function() {
      var deferred;
      if (initialised) {
        return;
      }
      deferred = $q.defer();
      $log.debug('ImgCache initialising');
      ImgCache.options.debug = CONFIG.cache.img.debug;
      ImgCache.options.chromeQuota = CONFIG.cache.img.chromeQuota;
      ImgCache.options.localCacheFolder = CONFIG.cache.img.localCacheFolder;
      ImgCache.options.useDataURI = CONFIG.cache.img.useDataURI;
      ImgCache.options.usePersistentCache = CONFIG.cache.img.usePersistentCache;
      ImgCache.options.cacheClearSize = CONFIG.cache.img.cacheClearSize;
      ImgCache.options.headers = CONFIG.cache.img.headers;
      ImgCache.options.skipURIencoding = CONFIG.cache.img.skipURIencoding;
      ImgCache.init(function() {
        $log.info('ImgCache init: success!');
        return deferred.resolve();
      }, function() {
        $log.error('ImgCache init: error! Check the log for errors');
        return deferred.reject();
      });
      return deferred.promise;
    },
    checkCacheStatus: function(src) {
      var deferred;
      deferred = $q.defer();
      ImgCache.isCached(src, function(path, success) {
        if (success) {
          deferred.resolve(path);
        } else {

        }
        ImgCache.cacheFile(src, function() {
          ImgCache.isCached(src, function(path, success) {
            deferred.resolve(path);
          }, deferred.reject);
        }, deferred.reject);
      }, deferred.reject);
      return deferred.promise;
    }
  };
}
