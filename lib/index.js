require('ionic-sdk/release/js/ionic.bundle');
require('angular-translate');
require('angular-cache');
require('angular-moment');
require('wp-api-angularjs');
require('ng-cordova');
require('moment');
require('imgcache.js');
require('./ios9-browser-patch.js');
require('./pouchdb-5.1.0.min.js');
var Config = require('./config.js');
var Run = require('./run.js');

// Style entry point
require('./scss/index.scss');

// Ionic wpapp App
// Creating namespace
window.wpapp = window.wpapp || {};
window.wpapp.translation = {};

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'wpapp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'wpapp.controllers' is found in controllers.js, wpIoinc.services is in services.js
module.exports = angular.module('wpapp', [
    'ionic',
    'ngIOS9UIWebViewPatch',
    'ui.router',
    require('./js/controllers/controllers.js').name,
    require('./js/services/services.js').name,
    require('./js/filters/filters.js').name,
    require('./js/directives/directives.js').name,
    require('./js/constants/constants.js').name,
    'angularMoment',
    'ngCordova',
    'wp-api-angularjs',
    'angular-cache'
  ])
  .config(Config)
  .run(Run);
