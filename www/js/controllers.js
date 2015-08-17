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

  // Sites view: templates/sites.html

  // console.log( $localstorage.getObject( 'sites' ).length );

  if( $localstorage.getObject( 'sites' ).length >= 1 ) {
    $scope.sites = $localstorage.getObject( 'sites' );
  } else {
    $scope.sites = [];
  }

  // angular.forEach(window.localStorage, function(value, key) {
  //   // Search local storage for existing sites
  //   var sub = key.substring(0, 4);
  //   if( sub == 'site' ) {
  //     $scope.sites.push( JSON.parse(value) );
  //   }
  // });

  // Add a site modal
  $ionicModal.fromTemplateUrl('templates/add-site-modal.html', {
    scope: $scope
  }).then(function(sitemodal) {
    $scope.sitemodal = sitemodal;
  });

  $scope.stripTrailingSlash = function(str) {
    if(str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
  }
  
  $scope.createSite = function(u) { 

    // Called when "create site" button is pressed

    if(!u) {
      alert('Please fill in all fields.');
      return;
    }

    $ionicLoading.show({
      noBackdrop: true
    });

    var siteURL = $scope.stripTrailingSlash( u.url );

    var siteApi = siteURL + '/wp-json/' + '?' + $rootScope.callback;

    DataLoader.get( siteApi ).success(function(data, status, headers, config) {

        var siteID = $rootScope.increment();
        var site = { id: siteID, title: data.name, description: data.description, url: siteURL, username: u.username, password: u.password };
        $scope.sites.push( site );
        // Create sites object for sites.html list page
        $localstorage.setObject( 'sites', $scope.sites );
        // Store site[id] object for later use
        $localstorage.setObject('site' + siteID, site );
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

  if( $scope.sites.length >= 1 ) {
    $scope.message = '';
  } else {
    $scope.message = 'Click + to add a site.';
  }

  $scope.onItemDelete = function(item) {

    $scope.sites.splice($scope.sites.indexOf(item), 1);
    console.log( item.id );
    $localstorage.setObject( 'sites', $scope.sites );

    angular.forEach( window.localStorage, function( value, key ) {
      var sub = key.substring(0, 5);
      console.log(sub);
      if( sub == 'site' + item.id ) {
        window.localStorage.removeItem(key);
      }
    });
  }

})

.controller('SiteCtrl', function($scope, $stateParams, $ionicLoading, $localstorage, $rootScope, DataLoader, $state ) {

  // Controller for single site detail page. templates/site.html

  // Site ID
  $scope.id = $stateParams.siteId;

  var site = $localstorage.getObject('site' + $scope.id );

  // Example data
  $scope.content = '<img src="img/male-circle-512.png" class="site-avatar" /><h2 class="padding">' + site.title + '</h2>';

  var url = site.url;

  // Default sections, can be passed in from somewhere else
  $scope.sitesections = [{'title': 'Comments', 'icon':'ion-ios-chatbubble-outline', 'route':'wp/v2/comments/' }, {'title': 'Posts', 'icon':'ion-ios-browsers-outline', 'route':'wp/v2/posts/' },{'title': 'Pages', 'icon':'ion-ios-paper-outline'},{'title': 'Media', 'icon':'ion-ios-cloud-outline'},{'title': 'Settings', 'icon':'ion-ios-gear-outline'}];

  var dataURL = url + '/wp-json/wp-app/v1/pages/?' + $rootScope.callback;

  // Example of adding a section
  DataLoader.get( dataURL ).success(function(data, status, headers, config) {
        //console.log(data);
        $scope.sitesections.push({ 'title': data.title, 'icon': data.icon });
        $ionicLoading.hide();
      })
      .error(function(data, status, headers, config) {
        $ionicLoading.hide();
        console.log('Error');
    });

})

.controller('SiteSectionCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, $timeout ) {

  // Individual site data (posts, comments, pages, etc). templates/site-section.html. Should be broken into different controllers and templates for more fine-grained control

  // console.log($stateParams);

  $scope.title = $stateParams.section.toLowerCase();

  $scope.id = $stateParams.siteId;

  var url = $localstorage.getObject('site' + $scope.id ).url;

  var dataURL = url + '/wp-json/wp/v2/' + $scope.title;

  // TODO: Change dataURL/loadData so we can get data from different endpoints too

  var siteData = $localstorage.getObject('site' + $scope.id + $scope.title );

  // Gets API data
  $scope.loadData = function() {

    // If we have local data saved, use that. Otherwise fetch data.
    if( siteData.length > 1 ) {
      // breaks on load more because $paged variable is wrong
      $scope.data = siteData;
      console.log('Loaded saved data only');
      console.dir(siteData);
      return;
    }

    $ionicLoading.show({
      noBackdrop: true
    });

    console.log('Fetching new data from API...');

    DataLoader.get( dataURL + '?' + $rootScope.callback ).success(function(data, status, headers, config) {
        $scope.data = data;
        $localstorage.setObject('site' + $scope.id + $scope.title, data );
        $ionicLoading.hide();
        console.dir(data);
      }).
      error(function(data, status, headers, config) {
        console.log('Error');
        $ionicLoading.hide();
    });

  }

  // Load posts on page load
  $scope.loadData();

  // TODO: Paged variable can't always start at 2, since we have locally stored data
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

        $localstorage.setObject('site' + $scope.id + $scope.title, $scope.data );

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

  // Item detail view (single post, comment, etc.) templates/site-section-details.html

  $scope.siteID = $stateParams.siteId;
  $scope.section = $stateParams.section;
  $scope.itemID = $stateParams.itemId;

  // Get data from locally stored object.
  // TODO: Need fallback to hit API if no data stored locally
  $scope.siteData = $localstorage.getObject('site' + $scope.siteID + $scope.section )[$stateParams.index];

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