module.exports = angular.module('wpapp.directives', [
      'wpapp.constants'
  ])
  .directive('hideWhen', require('./hideWhen/hideWhen.js'))
  .directive('uploadPhoto', require('./uploadPhoto/uploadPhoto.js'))
  .directive('postCard', require('./postCard/postCard.js'))
  .directive('postItem', require('./postItem/postItem.js'))
  .directive('postList', require('./postList/postList.js'))
  .directive('imgCache', require('./imgCache/imgCache.js')['imgCache'])
  .directive('imgCacheBackground', require('./imgCache/imgCache.js')['imgCacheBackground']);
