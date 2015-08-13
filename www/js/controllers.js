angular.module('wpApp.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $localstorage ) {

  // Controller for main view, anything global should go here
  
  $rootScope.increment = function() {
    var i = $localstorage.get('increment');
    if(!i) {
      $localstorage.set('increment', 1);
      return 1;
    } else {
      i++;
      $localstorage.set('increment', i );
      return i;
    }
  }
  
  $rootScope.callback = '_jsonp=JSON_CALLBACK';

})

.controller('SitesCtrl', function( $scope, $http, DataLoader, $timeout, $rootScope, $ionicModal, $localstorage, $ionicLoading ) {

  // Sites view

  $scope.sites = [];

  angular.forEach(window.localStorage, function(value, key) {
    // Search local storage for existing sites
    var sub = key.substring(0, 4);
    if( sub == 'site' ) {
      $scope.sites.push( JSON.parse(value) );
    }
  });

  // Add a site modal
  $ionicModal.fromTemplateUrl('templates/add-site-modal.html', {
    scope: $scope
  }).then(function(sitemodal) {
    $scope.sitemodal = sitemodal;
  });
  
  $scope.createSite = function(u) { 

    // Called when "create site" button is pressed

    if(!u) {
      alert('Please fill in all fields.');
      return;
    }

    $ionicLoading.show({
      noBackdrop: true
    });

    var siteURL = u.url + '/wp-json/';

    var siteApi = siteURL + '?' + $rootScope.callback;

    DataLoader.get( siteApi ).success(function(data, status, headers, config) {

        var siteID = $rootScope.increment();
        var site = { id: siteID, title: data.name, description: data.description, url: u.url, username: u.username, password: u.password };
        $scope.sites.push( site );
        $localstorage.set('site' + siteID, JSON.stringify( site ) );
        $ionicLoading.hide();
      })
      .error(function(data, status, headers, config) {
        $ionicLoading.hide();
        alert('Please make sure the WP-API plugin is installed on your site.');
        console.log('Site Factory error');
    });

    $scope.sitemodal.hide();

    $scope.message = '';
    
  };

  console.log( $scope.sites.length );

  if( $scope.sites.length < 1 ) {
    $scope.message = 'Click + to add a site.';
  } else {
    $scope.message = '';
  }

})

.controller('SiteCtrl', function($scope, $stateParams, $ionicLoading, $localstorage, $rootScope, DataLoader ) {

  // Controller for single site detail page

  // Site ID
  $scope.id = $stateParams.siteId;

  // Example data
  $scope.content = '<img src="img/male-circle-512.png" class="site-avatar" /><h2 class="padding">Your Site</h2>';

  // Default sections, can be passed in from somewhere else
  $scope.sitesections = [{'title': 'Comments', 'icon':'ion-ios-chatbubble-outline'}, {'title': 'Posts', 'icon':'ion-ios-browsers-outline' },{'title': 'Pages', 'icon':'ion-ios-paper-outline'},{'title': 'Media', 'icon':'ion-ios-cloud-outline'},{'title': 'Settings', 'icon':'ion-ios-gear-outline'}];

  var url = JSON.parse( $localstorage.get('site' + $scope.id ) ).url;

  var dataURL = url + '/wp-json/wp-app/v1/pages/?' + $rootScope.callback;

  // Example of adding a section
  DataLoader.get( dataURL ).success(function(data, status, headers, config) {
        console.log(data);
        $scope.sitesections.push({ 'title': data.title, 'icon': data.icon });
        $ionicLoading.hide();
      })
      .error(function(data, status, headers, config) {
        $ionicLoading.hide();
        console.log('Error');
    });

})

.controller('SiteSectionCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, $timeout ) {

  // Individual site data (posts, comments, pages, etc). Should be broken into different controllers and templates for more fine-grained control

  // $ionicLoading.show({
  //   noBackdrop: true
  // });

  $scope.title = $stateParams.section.toLowerCase();

  $scope.id = $stateParams.siteId;

  var url = JSON.parse( $localstorage.get('site' + $scope.id ) ).url;

  var dataURL = url + '/wp-json/wp/v2/' + $scope.title;

  // Gets API data
  $scope.loadData = function() {

    console.log('Loading data...');

    DataLoader.get( dataURL + '?' + $rootScope.callback ).success(function(data, status, headers, config) {
        $scope.data = data;
        console.dir(data);
      }).
      error(function(data, status, headers, config) {
        console.log('Error');
    });

  }

  // Load posts on page load
  $scope.loadData();

  paged = 2;
  $scope.moreItems = true;

  // Load more (infinite scroll)
  $scope.loadMore = function() {

    if( !$scope.moreItems ) {
      return;
    }

    console.log('loading more...');

    var pg = paged++;

    $timeout(function() {

      DataLoader.get( dataURL + '?page=' + pg + '&' + $rootScope.callback ).success(function(data, status, headers, config) {

        angular.forEach( data, function( value, key ) {
          $scope.data.push(value);
        });

        if( data.length <= 0 ) {
          $scope.moreItems = false;
        }
      }).
      error(function(data, status, headers, config) {
        $scope.moreItems = false;
        console.log('error');
      });

      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.resize');

    }, 1000);

  }

  $scope.moreDataExists = function() {
    return $scope.moreItems;
  }

  // Pull to refresh
  $scope.doRefresh = function() {
  
    console.log('Refreshing!');

    $timeout( function() {

      $scope.loadData();

      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    
    }, 1000);
      
  }

})

.controller('SiteSectionDetailCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage ) {

  // Item detail view (single post, comment, etc.)

  $ionicLoading.show({
    noBackdrop: true
  });

  $scope.siteID = $stateParams.siteId;
  $scope.section = $stateParams.section;
  $scope.itemID = $stateParams.itemId;

  var site = JSON.parse( $localstorage.get('site' + $stateParams.siteId ) );

  var url = site.url;

  var itemURL = url + '/wp-json/wp/v2/' + $stateParams.section + '/' + $stateParams.itemId;

  // Get our item. Shouldn't need to do this, need to cache API and pull from cache
  DataLoader.get( itemURL + '?' + $rootScope.callback ).success(function(data, status, headers, config) {
      $scope.data = data;
      $ionicLoading.hide();
    }).
    error(function(data, status, headers, config) {
      console.log('error');
      $ionicLoading.hide();
  });

  // Not working yet
  $scope.deleteComment = function() {
    // Not working, possible CORS error?
    var itemURL = url + '/wp-json/wp/v2/' + $stateParams.section + '/' + $stateParams.itemId;

    DataLoader.delete( site.username, site.password, itemURL ).success(function(data, status, headers, config) {
      console.dir(data);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data );
  });
  }

})

.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicViewService) {

  // Might use this intro for final app

  $ionicViewService.nextViewOptions({
    disableBack: true
  });
 
  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('app.posts');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };

});