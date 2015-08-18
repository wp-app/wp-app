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

    DataLoader.get( siteApi ).then(function(response) {

        var siteID = $rootScope.increment();
        var site = { id: siteID, title: response.data.name, description: response.data.description, url: siteURL, username: u.username, password: u.password };
        $scope.sites.push( site );
        // Create sites object for sites.html list page
        $localstorage.setObject( 'sites', $scope.sites );
        // Store site[id] object for later use
        $localstorage.setObject('site' + siteID, site );
        $ionicLoading.hide();
      }, function(response) {
        $ionicLoading.hide();
        alert('Please make sure the WP-API plugin is installed on your site.');
        console.log('Site Factory error');
    });

    $scope.sitemodal.hide();

    $scope.message = '';
    
  };


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
  $scope.sitesections = [{'title': { 'rendered': 'Comments' }, 'icon':'ion-ios-chatbubble-outline', 'route':'/wp/v2/comments/' }, {'title': { 'rendered': 'Posts' }, 'icon':'ion-ios-browsers-outline', 'route':'/wp/v2/posts/' },{'title': { 'rendered': 'Pages' }, 'icon':'ion-ios-paper-outline', 'route':'/wp/v2/pages/'},{'title': { 'rendered': 'Media' }, 'route':'/wp/v2/media/', 'icon':'ion-ios-cloud-outline'},{'title': { 'rendered': 'Settings' }, 'icon':'ion-ios-gear-outline'}];

  var dataURL = url + '/wp-json/wp-app/v1/app/?' + $rootScope.callback;

  // Example of adding a section
  DataLoader.get( dataURL ).then(function(response) {
        console.log( response.data );
        $scope.sitesections.push({ 'title': { 'rendered': response.data.title.rendered }, 'icon': response.data.icon, 'route': response.data.route });
        $ionicLoading.hide();
      }, function(response) {
        $ionicLoading.hide();
        console.log('No custom site sections to get.');
    });

  // Gets the API route from the link in site.html, which we use in SiteSectionCtrl
  $scope.apiRoute = function(route) {
    $rootScope.route = route;
  }

})

.controller('SiteSectionCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, $timeout ) {

  // Individual site data (posts, comments, pages, etc). templates/site-section.html. Should be broken into different controllers and templates for more fine-grained control

  // Get slug such as 'comments' from our route, to use to fetch data
  var slug = $rootScope.route.split('/');
  var slugindex = $rootScope.route.split('/').length - 2;
  $scope.slug = slug[slugindex];

  $scope.id = $stateParams.siteId;

  var dataURL = $localstorage.getObject('site' + $scope.id ).url + '/wp-json' + $rootScope.route;

  // Gets API data
  $scope.loadData = function() {

    $ionicLoading.show({
      noBackdrop: true
    });

    console.log('Fetching new data from API...');

    DataLoader.get( dataURL + '?' + $rootScope.callback ).then(function(response) {

        $scope.data = response.data;
        $ionicLoading.hide();

      }, function(response) {

        console.log('Error');
        $ionicLoading.hide();

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

    var pg = paged++;

    console.log('loading more...' + pg );

    $timeout(function() {

      DataLoader.get( dataURL + '?page=' + pg + '&' + $rootScope.callback ).then(function(response) {

        angular.forEach( response.data, function( value, key ) {
          $scope.data.push(value);
        });

        if( response.data.length <= 0 ) {
          $scope.moreItems = false;
        }
      }, function(response) {
        $scope.moreItems = false;
        console.log('Load more error');
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
  $scope.slug = $stateParams.slug;
  $scope.itemID = $stateParams.itemId;
  $scope.site = $localstorage.getObject('site' + $scope.siteID );
  var url = $scope.site.url;

  var dataURL = url + '/wp-json' + $rootScope.route + $scope.itemID;

  // Get data from locally stored object.
  var itemExists = $localstorage.getObject('site' + $scope.siteID + $scope.slug + $scope.itemID );

  if( JSON.stringify( itemExists ) === '{}' ) {

    // Item doesn't exists, so go get it
    DataLoader.get( dataURL + '?' + $rootScope.callback ).then(function(response) {
        $scope.siteData = response.data;
        $localstorage.setObject('site' + $scope.siteID + $scope.slug + $scope.itemID, response.data );
        $ionicLoading.hide();
        console.dir(response.data);
      }, function(response) {
        console.log('Error');
        $ionicLoading.hide();
    });

  } else {
    // Item exists, use localStorage
    $scope.siteData = itemExists;
  }

  // Not working yet
  $scope.deleteComment = function() {
    // Not working, possible CORS error?
    var itemURL = $scope.site.url + '/wp-json/wp/v2/' + $scope.slug + '/' + $scope.siteData.id;

    console.log(itemURL);

    DataLoader.delete( $scope.site.username, $scope.site.password, itemURL ).then(function(response) {
      console.dir(response.data);
    }, function(response) {
      console.log('Error: ' + response.data );
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