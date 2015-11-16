module.exports = function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, CacheFactory, SitesDB, Base64, $sce, $ionicHistory, $log) {
  'ngInject';

  // Controller for posts and pages single-post.html

  $log.log('PostCtrl');

  $scope.siteID = $stateParams.siteId;
  $scope.slug = 'posts';
  $scope.itemID = $stateParams.itemId;

  if (!CacheFactory.get( 'site' + $scope.siteID + $scope.slug )) {
    // Create cache
    CacheFactory.createCache( 'site' + $scope.siteID + $scope.slug );
  }

  var dataCache = CacheFactory.get( 'site' + $scope.siteID + $scope.slug );

  // API url to fetch data
  var dataURL = $rootScope.site.url + '/wp-json' + $rootScope.route + $scope.itemID;

  if( !dataCache.get($scope.itemID) ) {

    $ionicLoading.show({
      noBackdrop: true
    });

    // Item doesn't exists, so go get it
    DataLoader.getAuth( $rootScope.base64, dataURL ).then(function(response) {

        $scope.siteData = response.data;
        $scope.content = $sce.trustAsHtml(response.data.content.rendered);
        dataCache.put( response.data.id, response.data );

        $ionicLoading.hide();
        // console.dir(response.data);
      }, function(response) {
        $log.error(response);
        $ionicLoading.hide();
    });

  } else {
    // Item exists, use localStorage
    $scope.siteData = dataCache.get( $scope.itemID );
    $scope.content = $sce.trustAsHtml( $scope.siteData.content.rendered );
  }

  $scope.deletePost = function() {

    var itemURL = $rootScope.site.url + '/wp-json/wp/v2/' + $scope.slug + '/' + $scope.siteData.id;

    DataLoader.delete( $rootScope.base64, itemURL ).then(function(response) {

        // Remove item from cache
        dataCache.remove($scope.siteData.id);
        alert('Item deleted');

        // Go back to previous state. TODO: Deleted post still exists in old state, need to remove it
        $ionicHistory.goBack();

      }, function(response) {
        // Getting an error even if it's successful
        $log.error(response.data );
    });
  }

}
