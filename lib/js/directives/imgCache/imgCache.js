exports.imgCache = function($log) {
  'ngInject';
  return {
    restrict: 'A',
    link: function(scope, el, attrs) {
      return attrs.$observe('ngSrc', function(src) {
        return ImgCache.isCached(src, function(path, success) {
          if (success) {
            return ImgCache.useCachedFile(el);
          } else {
            return ImgCache.cacheFile(src, function() {
              return ImgCache.useCachedFile(el);
            });
          }
        });
      });
    }
  }
};

exports.imgCacheBackground = function() {
  return {
    restrict: 'A',
    link: function(scope, el, attrs) {
      var setBackgroundImage;
      setBackgroundImage = function(src) {
        return el.css({
          'background-image': "url('" + src + "')"
        });
      };
      return attrs.$observe('imgCacheBackground', function(src) {
        return ImgCache.isCached(src, function(path, success) {
          if (success) {
            return ImgCache.getCachedFileURL(src, function(src, srcCached) {
              return setBackgroundImage(srcCached);
            });
          } else {
            ImgCache.cacheFile(src, function() {});
            return setBackgroundImage(src);
          }
        });
      });
    }
  };
};
