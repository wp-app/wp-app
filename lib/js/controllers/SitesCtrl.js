module.exports = function($scope, $log, $rootScope, CacheFactory, CONFIG, $timeout, $ionicLoading, $ionicModal, DataLoader, $ionicPlatform, SitesDB ) {
  'ngInject';
  $log.info('SitesCtrl ok');

  var vm = this;

  // $scope.$on('$ionicView.enter', enter);
  // $scope.$on('$ionicView.loaded', load);

  // Sites view: templates/sites.html

  if ( ! CacheFactory.get('siteCache') ) {
    CacheFactory.createCache('siteCache');
  }
  
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

  $scope.sitemodal = $ionicModal.fromTemplate(require("../../templates/add-site-modal.html"), {
    scope: $scope,
    animation: 'slide-in-up'
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

    var siteApi = siteURL + '/wp-json/';

    DataLoader.get( siteApi ).then(function(response) {

        var site = { title: response.data.name, description: response.data.description, url: siteURL, username: u.username, password: u.password };

        // Add site to cache
        SitesDB.addSite( site );

        // TODO: clear form fields here

        $ionicLoading.hide();
      }, function(response) {
        $ionicLoading.hide();
        alert('Please make sure the WP-API plugin v2 is installed on your site.');
        $log.error(response);
    });

    $scope.sitemodal.hide();

    $scope.message = '';
    
  };

  $scope.onItemDelete = function(item) {

    // $log.log('Deleting site: ' + item.id);
      
    angular.forEach( window.localStorage, function( value, key ) {
      // find and delete all site[id] caches (pages,posts,comments,etc)
      if ( key.indexOf( 'site' + item._id ) >= 0 ) {
        window.localStorage.removeItem( key );
      }
    })
    
    SitesDB.deleteSite( item );

  }

}