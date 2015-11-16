module.exports = function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, CacheFactory, SitesDB, Base64, $sce, $ionicHistory, $log) {
  'ngInject';

  $scope.siteID = $stateParams.siteId;
  $scope.slug = 'comments';
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
        $scope.commentStatus = response.data.status;

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
    $scope.commentStatus = $scope.siteData.status;
  }

  $scope.deleteComment = function() {

    var itemURL = $rootScope.site.url + '/wp-json/wp/v2/' + $scope.slug + '/' + $scope.siteData.id;

    DataLoader.delete( $rootScope.base64, itemURL ).then(function(response) {

        // Remove item from cache
        dataCache.remove($scope.siteData.id);
        alert('Item deleted');

        // Go back to previous state. TODO: Deleted comment still exists in old state, need to remove it. Use $scope.$on('$ionicView.enter', function(e) { });
        $ionicHistory.goBack();

      }, function(response) {
        // Getting an error even if it's successful
        $log.error(response.data );
    });
  }

  $scope.approveComment = function(data) {

    // TODO: after approval, change class of .card.hold to .card.approved

    var options = {
      'status': 'approved'
    }

    var itemURL = $rootScope.site.url + '/wp-json/wp/v2/' + $scope.slug + '/' + $scope.siteData.id;

    DataLoader.put( $rootScope.base64, itemURL, options ).then(function(response) {

        dataCache.put( $scope.siteData.id, response.data );
        alert('Item approved');

      }, function(response) {
        // Getting an error even if it's successful
        $log.error(response );
    });
  }

}
