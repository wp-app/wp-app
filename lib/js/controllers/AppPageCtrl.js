module.exports = function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, CacheFactory, $sce, $timeout, $ionicPlatform, SitesDB, Base64, $log) {
  'ngInject';

  // Single App Page view singe-apppage.html

  $log.log('apppagectrl');

  $rootScope.siteCache = CacheFactory.get('siteCache');

  $scope.siteID = $stateParams.siteId;
  $scope.slug = $stateParams.slug;
  $scope.itemID = $stateParams.itemId;
  
  var url = $rootScope.site.url;
  
  if (!CacheFactory.get( 'site' + $scope.siteID + $scope.slug )) {
    // Create cache
    CacheFactory.createCache( 'site' + $scope.siteID + $scope.slug );
  }

  // Our data cache, i.e. site1postscache
  var dataCache = CacheFactory.get( 'site' + $scope.siteID + $scope.slug );

  // API url to fetch data
  var dataURL = url + '/wp-json' + $rootScope.route + $scope.itemID;

  // Handle charts
  $scope.loadChart = function(data) {

    $log.log('loading chart');

    if(!data)
      return;

    $timeout( function() {

      var ctx = document.getElementById("myChart").getContext("2d");
      var myNewChart = new Chart(ctx).Line( data );
    
    }, 1000);

  }

  if( !dataCache.get($scope.itemID) ) {

    $ionicLoading.show({
      noBackdrop: true
    });

    // Item doesn't exists, so go get it
    DataLoader.getAuth( $rootScope.base64, dataURL ).then(function(response) {
        $log.log(response.data);
        $scope.siteData = response.data;
        $scope.content = $sce.trustAsHtml(response.data.content.rendered);
        dataCache.put( response.data.id, response.data );

        if(response.data.chart) {
          $scope.loadChart(response.data.chart);
        }

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
    
    if($scope.siteData.chart) {
      $scope.loadChart( $scope.siteData.chart );
    }
  }

}
