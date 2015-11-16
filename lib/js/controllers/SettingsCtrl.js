module.exports = function($scope, $log, $rootScope, LanguageService, $ionicPlatform, SitesDB, $stateParams) {
  'ngInject';

  // Individual site settings, settings.html

  var vm = this;
  vm.languages = LanguageService.getLanguagesList()
  vm.changeLanguage = changeLanguage;

  $scope.$on('$ionicView.enter', enter);

  function enter() {
    vm.selected = {
      language: LanguageService.getLocale()
    };
  }

  function changeLanguage() {
    $log.info('changing language to: ' + vm.selected.language);
    LanguageService.setLocale(vm.selected.language);
    $rootScope.$broadcast('$intervention.LanguageChanged', vm.selected.language);
  }

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
    //$log.log($scope.settings);
    $scope.site.url = $scope.settings.url;
    $scope.site.username = $scope.settings.username;
    $scope.site.password = $scope.settings.password;
    //$log.log($scope.site);
    
    SitesDB.updateSite( $scope.site ).then( function() {
      alert('Saved!');
  });
    
  }
}
