module.exports = function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $timeout, $ionicPlatform, SitesDB, Base64, CacheFactory, $log) {
  'ngInject';
  $log.info('SiteSectionCtrl ok', $scope);

  // Individual site data (posts, comments, pages, etc). templates/site-section.html. Should be broken into different controllers and templates for more fine-grained control

  var vm = this;

  $rootScope.base64 = Base64.encode( $rootScope.site.username + ':' + $rootScope.site.password );
  var dataURL = '';
  $scope.siteID = $stateParams.siteId;
  $scope.ids = [];

  // Get slug such as 'comments' from our route, to use to fetch data
  if($rootScope.route) {
    var slug = $rootScope.route.split('/');
    var slugindex = $rootScope.route.split('/').length - 2;
    $scope.slug = slug[slugindex];
  }

  var options = '';

  if($scope.slug === 'comments') {
    options = '?status';
  }

  dataURL = $rootScope.site.url + '/wp-json' + $rootScope.route + options;

  $log.log(dataURL);
  
  // Gets API data
  $scope.loadData = function() {

    DataLoader.getAuth( $rootScope.base64, dataURL ).then(function(response) {

        $scope.data = response.data;
        $log.log(response.data);
        $ionicLoading.hide();

        // Save all IDs so we can check for them in the loadmore func
        angular.forEach( $scope.data, function( value, key ) {
          $scope.ids.push(value.id);
        });

      }, function(response) {

        $log.error(response);
        $ionicLoading.hide();

    });

  }

  // Load data on page load
  $scope.loadData();
  
  var paged = 2;
  $scope.moreItems = true;

  // Load more (infinite scroll)
  $scope.loadMore = function() {

    if( !$scope.moreItems ) {
      return;
    }

    if( !paged || paged == 1 ) {
      var paged = 2;
    }

    var pg = paged++;

    $log.log('loading more...' + pg );

    $timeout(function() {

      DataLoader.getAuth( $rootScope.base64, dataURL + '?page=' + pg ).then(function(response) {

        angular.forEach( response.data, function( value, key ) {

          // Don't load more if item is not new
          if( $scope.ids.indexOf(value.id) >= 0 ) {
            $scope.moreItems = false;
            return;
          }

          $scope.data.push(value);
          $scope.ids.push(value.id);
        });

      }, function(response) {
        $scope.moreItems = false;
        $log.error('Load more error');
      });

      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.resize');

    }, 2000);

  }

  $scope.moreDataExists = function() {
    return $scope.moreItems;
  }

  // Pull to refresh
  $scope.doRefresh = function() {
  
    $log.log('Refreshing!');

    $timeout( function() {

      $scope.loadData();

      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    
    }, 1000);
      
  }

}
