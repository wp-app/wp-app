module.exports = function($ionicPlatform, $log, CONFIG, CacheImg) {
  'ngInject';

  $log.info('app running');

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

    $log.debug('ImgCache initialising');
    return CacheImg.init().then(function() {
      return $log.debug('ImgCache init: success!');
    }, function() {
      return $log.error('ImgCache init: error! Check the log for errors');
    });

  });
}
