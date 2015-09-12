// Ionic wpApp App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'wpApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'wpApp.controllers' is found in controllers.js, wpIoinc.services is in services.js
angular.module('wpApp', ['ionic','ionic.service.core', 'wpApp.controllers', 'wpApp.services', 'ngCordova', 'angular-cache', 'chart.js'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, CacheFactoryProvider) {

  angular.extend(CacheFactoryProvider.defaults, { 
    'storageMode': 'localStorage',
    'capacity': 100
  })

  // Native scrolling
  if( ionic.Platform.isAndroid() ) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
  }

  $stateProvider

  // sets up our default state, all views are loaded through here
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/tabs.html",
    controller: 'AppCtrl'
  })

  // .state('app.intro', {
  //   url: "/intro",
  //   views: {
  //     'menuContent': {
  //       templateUrl: "templates/intro.html",
  //       controller: 'IntroCtrl'
  //     }
  //   }
  // })

  .state('app.sites', {
    url: "/sites",
    views: {
      'sites-view': {
        templateUrl: "templates/sites.html",
        controller: 'SitesCtrl'
      }
    }
  })

  .state('app.site', {
    url: "/sites/:siteId",
    views: {
      'sites-view': {
        templateUrl: "templates/site.html",
        controller: 'SiteCtrl'
      }
    }
  })

  .state('app.sitepage', {
    url: "/sites/:siteId/:slug",
    views: {
      'sites-view': {
        templateUrl: "templates/site-section.html",
        controller: 'SiteSectionCtrl'
      }
    }
  })

  .state('app.sitesettings', {
    url: "/settings/:siteId",
    views: {
      'sites-view': {
        templateUrl: "templates/settings.html",
        controller: 'SiteSettingsCtrl'
      }
    }
  })

  .state('app.comment', {
    url: "/sites/:siteId/comments/:itemId",
    views: {
      'sites-view': {
        templateUrl: "templates/single-comment.html",
        controller: 'CommentCtrl'
      }
    }
  })

  .state('app.post', {
    url: "/sites/:siteId/posts/:itemId",
    views: {
      'sites-view': {
        templateUrl: "templates/single-post.html",
        controller: 'PostCtrl'
      }
    }
  })

  .state('app.page', {
    url: "/sites/:siteId/pages/:itemId",
    views: {
      'sites-view': {
        templateUrl: "templates/single-post.html",
        controller: 'PostCtrl'
      }
    }
  })

  // Default state for all custom added pages
  .state('app.apppages', {
    url: "/sites/:siteId/:slug/:itemId",
    views: {
      'sites-view': {
        templateUrl: "templates/single-apppage.html",
        controller: 'AppPageCtrl'
      }
    }
  })

  .state('app.stats', {
    url: "/stats",
    views: {
      'stats-view': {
        templateUrl: "templates/stats.html",
        controller: 'StatsCtrl'
      }
    }
  })

  .state('app.notifications', {
    url: "/notifications",
    views: {
      'notifications-view': {
        templateUrl: "templates/notifications.html"
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/sites');
});