module.exports = angular.module('wpapp.controllers', [
    'wpapp.constants'
  ])
  .controller('AppCtrl', require('./AppCtrl.js'))
  .controller('SitesCtrl', require('./SitesCtrl.js'))
  .controller('SiteCtrl', require('./SiteCtrl.js'))
  .controller('SiteSectionCtrl', require('./SiteSectionCtrl.js'))
  .controller('CommentCtrl', require('./CommentCtrl.js'))
  .controller('PostCtrl', require('./PostCtrl.js'))
  .controller('AppPageCtrl', require('./AppPageCtrl.js'))
  .controller('SettingsCtrl', require('./SettingsCtrl.js'));
