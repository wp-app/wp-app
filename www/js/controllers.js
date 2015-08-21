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

.controller('SitesCtrl', function( $scope, $http, DataLoader, $timeout, $rootScope, $ionicModal, $localstorage, $ionicLoading, CacheFactory ) {

  // Sites view: templates/sites.html

  
  $scope.loadSites = function() {
	  
	  $scope.sites = [];
	  
	  localSites.allDocs({ include_docs: true }).then( function ( results ) {
		  
		  $scope.$apply( function() {
			  angular.forEach( results.rows, function( result ) {
				 $scope.sites.push( result.doc ); 
			  });
		  });

	  });
	  
	  localSites.info().then( function ( info ) {
		 
		 if ( info.doc_count > 0 ) {
			 $scope.message = '';
		 } else {
			 $scope.message = "Click + to add a site.";
		 }
		 
	  });
	  
  };
  
  $scope.loadSites();
  
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

        var site = { _id: new Date().toISOString(), title: response.data.name, description: response.data.description, url: siteURL, username: u.username, password: u.password };

        // Add site to cache
        localSites.put( site ).then( function ( response ) {
	    	$scope.loadSites();
        }).catch( function( err ) {
	    	console.log( err ); 
        });

        $ionicLoading.hide();
      }, function(response) {
        $ionicLoading.hide();
        alert('Please make sure the WP-API plugin is installed on your site.');
        console.log('Site Factory error');
    });

    $scope.sitemodal.hide();

    $scope.message = '';
    
  };

  $scope.onItemDelete = function(item) {

    // console.log('Deleting site: ' + item.id);

    localSites.get( item._id ).then( function( doc ) {
	    
	    angular.forEach( window.localStorage, function( value, key ) {
		    // find and delete all site[id] caches (pages,posts,comments,etc)
		    if ( key.indexOf( 'site' + item._id ) >= 0 ) {
			    window.localStorage.removeItem( key );
		    }
	    })
	    
	    return localSites.remove( doc );
	    
    }).then( function( result ) {
	    $scope.loadSites();
    }).catch( function( err ) {
	   console.log( err ); 
    });

  }

})

.controller('SiteCtrl', function($scope, $stateParams, $ionicLoading, $localstorage, $rootScope, DataLoader, $state ) {

  // Controller for single site detail page. templates/site.html

  // Site ID
  $scope.id = $stateParams.siteId;

  localSites.get( $scope.id ).then( function( doc ) {
	  var site = doc;
	  
	  // Example data
	  $scope.content = '<img src="img/male-circle-512.png" class="site-avatar" /><h2 class="padding">' + site.title + '</h2>';
	
	  var url = site.url;
	
	  // Default sections, can be passed in from somewhere else
	  $scope.sitesections = [{'title': { 'rendered': 'Comments' }, 'icon':'ion-ios-chatbubble-outline', 'route':'/wp/v2/comments/' }, {'title': { 'rendered': 'Posts' }, 'icon':'ion-ios-browsers-outline', 'route':'/wp/v2/posts/' },{'title': { 'rendered': 'Pages' }, 'icon':'ion-ios-paper-outline', 'route':'/wp/v2/pages/'},{'title': { 'rendered': 'Media' }, 'route':'/wp/v2/media/', 'icon':'ion-ios-cloud-outline'}];
	
	  var dataURL = url + '/wp-json/wp-app/v1/app/?' + $rootScope.callback;
	
	  // Example of adding a section
	  DataLoader.get( dataURL ).then(function(response) {
	        // console.log( response.data );
	        $scope.sitesections.push({ 'title': { 'rendered': response.data.title.rendered }, 'icon': response.data.icon, 'route': response.data.route });
	        $ionicLoading.hide();
	      }, function(response) {
	        $ionicLoading.hide();
	        console.log('No custom site sections to get.');
	    });

  }).catch( function ( err ) {
	  console.log( err );
  });

  // Gets the API route from the link in site.html, which we use in SiteSectionCtrl
  $scope.apiRoute = function(route) {
    $rootScope.route = route;
  }

})

.controller('SiteSectionCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, $timeout ) {

  // Individual site data (posts, comments, pages, etc). templates/site-section.html. Should be broken into different controllers and templates for more fine-grained control

  // Get slug such as 'comments' from our route, to use to fetch data
  if($rootScope.route) {
    var slug = $rootScope.route.split('/');
    var slugindex = $rootScope.route.split('/').length - 2;
    $scope.slug = slug[slugindex];
  }
  
  // Gets API data
  $scope.loadData = function() {

    // $ionicLoading.show({
    //   noBackdrop: true
    // });

    DataLoader.get( $scope.dataURL + '?' + $rootScope.callback ).then(function(response) {

        $scope.data = response.data;
        $ionicLoading.hide();

      }, function(response) {

        console.log('Error');
        $ionicLoading.hide();

    });

  }

  $scope.id = $stateParams.siteId;
  $scope.dataURL = '';

  localSites.get( $scope.id ).then( function( doc ) {
	  $scope.dataURL = doc.url + '/wp-json' + $rootScope.route;
	  // Load posts on page load
	  $scope.loadData();
  });
  
  //var dataURL = $rootScope.siteCache.get($scope.id).url + '/wp-json' + $rootScope.route;


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

      DataLoader.get( $scope.dataURL + '?page=' + pg + '&' + $rootScope.callback ).then(function(response) {

        // Prevent load more bug
        if( response.data.length <= 0 || response.data[0].id === $scope.data[0].id || response.data[0].content === $scope.data[0].content ) {
          $scope.moreItems = false;
          return;
        }

        angular.forEach( response.data, function( value, key ) {
          $scope.data.push(value);
        });

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

.controller('SiteSettingsCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope ) {

  // Individual site settings, settings.html
  $scope.settings = {};
  //$scope.site = $rootScope.siteCache.get($stateParams.siteId);
  localSites.get( $stateParams.siteId ).then( function( doc ) {
	  console.log(doc);
	  $scope.$apply( function () {
		  $scope.site = doc;
		  $scope.siteTitle = $scope.site.title;
		  $scope.settings.url = $scope.site.url;
		  $scope.settings.username = $scope.site.username;
		  $scope.settings.password = $scope.site.password;
	  });
  })
  
  
  

  //$scope.$on( '$ionicView.leave', $scope.saveSettings );

  $scope.saveSettings = function() {
    //console.log($scope.settings);
    $scope.site.url = $scope.settings.url;
    $scope.site.username = $scope.settings.username;
    $scope.site.password = $scope.settings.password;
    // $scope.site.push( url );
    //console.log($scope.site);
    
    localSites.get( $stateParams.siteId ).then( function( doc ) {
	    return localSites.put({
		    _id: doc._id,
		    _rev: doc._rev,
		    url: $scope.site.url,
		    username: $scope.site.username,
		    password: $scope.site.password
	    });
    }).then( function( response ) {
	    alert('Saved!');
    }).catch( function( err ) {
	   console.log( err ); 
    });
    
  }

})

.controller('SiteSectionDetailCtrl', function($scope, $stateParams, DataLoader, $ionicLoading, $rootScope, $localstorage, CacheFactory ) {

  // Item detail view (single post, comment, etc.) templates/site-section-details.html

  $rootScope.siteCache = CacheFactory.get('siteCache');

  $scope.siteID = $stateParams.siteId;
  $scope.slug = $stateParams.slug;
  $scope.itemID = $stateParams.itemId;
  //$scope.site = $rootScope.siteCache.get($scope.siteID);
  
  localSites.get( $scope.siteID ).then( function( doc ) {
	  $scope.site = doc;
	  
	  var url = $scope.site.url;

	  if (!CacheFactory.get( 'site' + $scope.siteID + $scope.slug )) {
	    // Create cache
	    CacheFactory.createCache( 'site' + $scope.siteID + $scope.slug );
	  }
	
	  // Our data cache, i.e. site1postscache
	  var dataCache = CacheFactory.get( 'site' + $scope.siteID + $scope.slug );
	
	  //console.log(dataCache);
	
	  // API url to fetch data
	  var dataURL = url + '/wp-json' + $rootScope.route + $scope.itemID;
	
	  // Get data from locally stored object.
	  // var itemExists = $localstorage.getObject('site' + $scope.siteID + $scope.slug + $scope.itemID );
	
	  if( !dataCache.get($scope.itemID) ) {
	
	    $ionicLoading.show({
	      noBackdrop: true
	    });
	
	    // Item doesn't exists, so go get it
	    DataLoader.get( dataURL + '?' + $rootScope.callback ).then(function(response) {
	
	        $scope.siteData = response.data;
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
	  }
	  
  });
  

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

.controller('StatsCtrl', function($scope ) {

  // This is our data for stats.html

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['2014', '2015'];
  $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
  ];
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