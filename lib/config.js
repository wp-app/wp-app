module.exports = function($stateProvider, $urlRouterProvider, $ionicConfigProvider, CacheFactoryProvider, WpApiProvider ) {
  'ngInject';

  WpApiProvider.setBaseUrl('http://10.0.1.3/wp-json');

  if (ionic.Platform.isAndroid()) {
    $ionicNativeTransitionsProvider.enable(false);
  }

  setTimeout( function() {
    if(navigator.splashscreen)
      navigator.splashscreen.hide();
  }, 1500);

  angular.extend(CacheFactoryProvider.defaults, {
    'storageMode': 'localStorage',
    'capacity': 30,
    'maxAge': 4000 * 60 * 1000,
    'deleteOnExpire': 'aggressive'
  });

  // Native scrolling
  $ionicConfigProvider.scrolling.jsScrolling(false);

  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.backButton.text('');

  $stateProvider

  // sets up our default state, all views are loaded through here
  .state('app', {
    url: "/app",
    abstract: true,
    template: require("./templates/tabs.html"),
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
        template: require("./templates/sites.html"),
        controller: 'SitesCtrl'
      }
    }
  })

  .state('app.site', {
    url: "/sites/:siteId",
    views: {
      'sites-view': {
        template: require("./templates/site.html"),
        controller: 'SiteCtrl'
      }
    }
  })

  .state('app.sitepage', {
    url: "/sites/:siteId/:slug",
    views: {
      'sites-view': {
        template: require("./templates/site-section.html"),
        controller: 'SiteSectionCtrl'
      }
    }
  })

  .state('app.sitesettings', {
    url: "/settings/:siteId",
    views: {
      'sites-view': {
        template: require("./templates/settings.html"),
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.comment', {
    url: "/sites/:siteId/comments/:itemId",
    views: {
      'sites-view': {
        template: require("./templates/single-comment.html"),
        controller: 'CommentCtrl'
      }
    }
  })

  .state('app.post', {
    url: "/sites/:siteId/posts/:itemId",
    views: {
      'sites-view': {
        template: require("./templates/single-post.html"),
        controller: 'PostCtrl'
      }
    }
  })

  .state('app.page', {
    url: "/sites/:siteId/pages/:itemId",
    views: {
      'sites-view': {
        template: require("./templates/single-post.html"),
        controller: 'PostCtrl'
      }
    }
  })

  // Default state for all custom added pages
  .state('app.apppages', {
    url: "/sites/:siteId/:slug/:itemId",
    views: {
      'sites-view': {
        template: require("./templates/single-apppage.html"),
        controller: 'AppPageCtrl'
      }
    }
  })

  .state('app.stats', {
    url: "/stats",
    views: {
      'stats-view': {
        template: require("./templates/stats.html"),
        controller: 'StatsCtrl'
      }
    }
  })

  .state('app.notifications', {
    url: "/notifications",
    views: {
      'notifications-view': {
        template: require("./templates/notifications.html")
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/sites');
}
