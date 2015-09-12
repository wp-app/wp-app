angular.module('wpApp.controllers', [])

/*
 * TODO: Cached views don't update when item is deleted or changed, we need to check if anything changed on enter, and update the scope. Should be a background process so we don't affect performance.
 */

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

.controller('SitesCtrl', function( $scope, $http, DataLoader, $timeout, $rootScope, $ionicModal, $localstorage, $ionicLoading, CacheFactory, $ionicPlatform, SitesDB ) {

  // Sites view: templates/sites.html
  
  // Initialize the database
  $ionicPlatform.ready( function() {
	 SitesDB.initDB(); 
	 
	 // Get all the sites from the database.
	 SitesDB.getAllSites().then( function( sites ) {
		 $scope.sites = sites;
	 });
	 
	 SitesDB.count().then( function( count ) {
		if ( count > 0 ) {
			$scope.message = '';
		} else {
			$scope.message = "Click + to add a site.";
		}
	 });
  });
  
  if ( ! CacheFactory.get('siteCache') ) {
	  CacheFactory.createCache('siteCache');
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

    if(!u.username || !u.password || !u.url ) {
      alert('Please fill in all fields.');
      return;
    }

    $ionicLoading.show({
      noBackdrop: true
    });

    var siteURL = $scope.stripTrailingSlash( u.url );

    var siteApi = siteURL + '/wp-json/' + '?' + $rootScope.callback;

    DataLoader.get( siteApi ).then(function(response) {

        var site = { title: response.data.name, description: response.data.description, url: siteURL, username: u.username, password: u.password };

        // Add site to cache
        SitesDB.addSite( site );

        // TODO: clear form fields here

        $ionicLoading.hide();
      }, function(response) {
        $ionicLoading.hide();
        alert('Please make sure the WP-API plugin v2 is installed on your site.');
        console.log('Site Factory error');
    });

    $scope.sitemodal.hide();

    $scope.message = '';
    
  };

  $scope.onItemDelete = function(item) {

    // console.log('Deleting site: ' + item.id);
	    
    angular.forEach( window.localStorage, function( value, key ) {
	    // find and delete all site[id] caches (pages,posts,comments,etc)
	    if ( key.indexOf( 'site' + item._id ) >= 0 ) {
		    window.localStorage.removeItem( key );
	    }
    })
    
    SitesDB.deleteSite( item );

  }

})

.controller('SiteCtrl', function($scope, $stateParams, $ionicLoading, $localstorage, $rootScope, DataLoader, $state, $ionicPlatform, SitesDB ) {

  // Controller for single site detail page. templates/site.html

  // Site ID
  $scope.id = $stateParams.siteId;
  
  // Initialize the database.
  $ionicPlatform.ready( function() {
	 SitesDB.initDB();
	 
	 SitesDB.getSite( $scope.id ).then( function( site ) {

    // Add this to rootScope so we don't have to make a DB call in other controllers
    $rootScope.site = site;

		// Example data
		$scope.content = '<img src="img/male-circle-512.png" class="site-avatar" /><h2 class="padding">' + site.title + '</h2>';
		
		var url = site.url;
		
		// Default sections, can be passed in from somewhere else
		$scope.sitesections = [{'title': { 'rendered': 'Comments' }, 'icon':'ion-ios-chatbubble-outline', 'route':'/wp/v2/comments/' }, {'title': { 'rendered': 'Posts' }, 'icon':'ion-ios-browsers-outline', 'route':'/wp/v2/posts/' },{'title': { 'rendered': 'Pages' }, 'icon':'ion-ios-paper-outline', 'route':'/wp/v2/pages/'}, {'title': { 'rendered': 'Users' }, 'icon':'ion-person', 'route':'/wp/v2/users/'}];
		
		var dataURL = url + '/wp-json/wp-app/v1/app/?' + $rootScope.callback;
		
		// Example of adding a section
		DataLoader.get( dataURL ).then(function(response) {

        angular.forEach( response.data, function( value, key ) {

          console.log( value );

          $scope.sitesections.push({ 'title': { 'rendered': value.title.rendered }, 'icon': value.icon, 'route': value.route });

        });
		    
		    $ionicLoading.hide();
		  }, function(response) {
		    $ionicLoading.hide();
		    console.log('No custom site sections to get.');
		});

	 });
  });

  // Gets the API route from the link in site.html, which we use in SiteSectionCtrl
  $scope.apiRoute = function(route) {
    $rootScope.route = route;
  }

})

.controller('SiteSectionCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, $timeout, $ionicPlatform, SitesDB, Base64, CacheFactory ) {

  // Individual site data (posts, comments, pages, etc). templates/site-section.html. Should be broken into different controllers and templates for more fine-grained control

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
  
  // Gets API data
  $scope.loadData = function() {

    DataLoader.getAuth( $rootScope.base64, dataURL ).then(function(response) {

        $scope.data = response.data;
        $ionicLoading.hide();

        // Save all IDs so we can check for them in the loadmore func
        angular.forEach( $scope.data, function( value, key ) {
          $scope.ids.push(value.id);
        });

      }, function(response) {

        console.log('Error');
        $ionicLoading.hide();

    });

  }

  var options = '';

  if($scope.slug === 'comments') {
    options = '?status';
  }

  dataURL = $rootScope.site.url + '/wp-json' + $rootScope.route + options;

  // Load data on page load
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
        console.log('Load more error');
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
  
    console.log('Refreshing!');

    $timeout( function() {

      $scope.loadData();

      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    
    }, 1000);
      
  }

})

.controller('CommentCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, CacheFactory, SitesDB, Base64, $sce, $ionicHistory ) {

  console.log('CommentCtrl');

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
        console.log('Error');
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

        // Go back to previous state. TODO: Deleted comment still exists in old state, need to remove it
        $ionicHistory.goBack();

      }, function(response) {
        // Getting an error even if it's successful
        console.log(response.data );
    });
  }

  $scope.approveComment = function(data) {

    var options = {
      'status': 'approved'
    }

    var itemURL = $rootScope.site.url + '/wp-json/wp/v2/' + $scope.slug + '/' + $scope.siteData.id;

    DataLoader.put( $rootScope.base64, itemURL, options ).then(function(response) {

        dataCache.put( $scope.siteData.id, response.data );
        alert('Item approved');

      }, function(response) {
        // Getting an error even if it's successful
        console.log(response );
    });
  }

})

.controller('PostCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, CacheFactory, SitesDB, Base64, $sce, $ionicHistory ) {

  // Controller for posts and pages single-post.html

  console.log('PostCtrl');

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
        console.log('Error');
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
        console.log(response.data );
    });
  }

})

.controller('AppPageCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, CacheFactory, $sce, $timeout, $ionicPlatform, SitesDB, Base64 ) {

  // Single App Page view singe-apppage.html

  console.log('apppagectrl');

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

    console.log('loading chart');

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
        console.log(response.data);
        $scope.siteData = response.data;
        $scope.content = $sce.trustAsHtml(response.data.content.rendered);
        dataCache.put( response.data.id, response.data );

        if(response.data.chart) {
          $scope.loadChart(response.data.chart);
        }

        $ionicLoading.hide();
        // console.dir(response.data);
      }, function(response) {
        console.log('Error');
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

})

.controller('StatsCtrl', function($scope ) {

  // This is our data for stats.html

  // Need this stuff if canvas element does not have attributes for data, options, etc.
  // var ctx = document.getElementById("line").getContext("2d");
  // var myNewChart = new Chart(ctx).Line(data, options);

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['2014', '2015'];
  $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
  ];

})

.controller('SiteSettingsCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $ionicPlatform, SitesDB ) {

  // Individual site settings, settings.html
  $scope.settings = {};
  //$scope.site = $rootScope.siteCache.get($stateParams.siteId);
  
  // Initialize the database.
  $ionicPlatform.ready( function() {
   SitesDB.initDB();
   
   SitesDB.getSite( $stateParams.siteId ).then( function( site ) {
     $scope.site = site;
     $scope.siteTitle = $scope.site.title;
     $scope.settings.url = $scope.site.url;
     $scope.settings.username = $scope.site.username;
     $scope.settings.password = $scope.site.password;
   });
  });
  

  //$scope.$on( '$ionicView.leave', $scope.saveSettings );

  $scope.saveSettings = function() {
    //console.log($scope.settings);
    $scope.site.url = $scope.settings.url;
    $scope.site.username = $scope.settings.username;
    $scope.site.password = $scope.settings.password;
    //console.log($scope.site);
    
    SitesDB.updateSite( $scope.site ).then( function() {
      alert('Saved!');
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