module.exports = function($scope, $stateParams, $ionicLoading, $rootScope, DataLoader, $state, $ionicPlatform, SitesDB, $log) {
  'ngInject';

  //$scope.$on('$ionicView.enter', enter );

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
    $scope.sitesections = [{'title': { 'rendered': 'Comments' }, 'icon':'ion-ios-chatbubble-outline', 'route':'/wp/v2/comments/' }, {'title': { 'rendered': 'Posts' }, 'icon':'ion-ios-browsers-outline', 'route':'/wp/v2/posts/' },{'title': { 'rendered': 'Pages' }, 'icon':'ion-ios-paper-outline', 'route':'/wp/v2/pages/'}];
    
    var dataURL = url + '/wp-json/wp-app/v1/app/?' + $rootScope.callback;
    
    // Example of adding a section
    DataLoader.get( dataURL ).then(function(response) {

        angular.forEach( response.data, function( value, key ) {

          $log.log( value );

          $scope.sitesections.push({ 'title': { 'rendered': value.title.rendered }, 'icon': value.icon, 'route': value.route });

        });
        
        $ionicLoading.hide();
      }, function(response) {
        $ionicLoading.hide();
        $log.log('No custom site sections to get.');
    });

   });
  });

  // Gets the API route from the link in site.html, which we use in SiteSectionCtrl
  $scope.apiRoute = function(route) {
    $rootScope.route = route;
  }

}
