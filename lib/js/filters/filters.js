module.exports = angular.module('wpapp.filters', [
      'wpapp.constants'
  ])
.filter('html_filters', require('./htmlFilters.js'))
.filter('clean_json', require('./cleanJson.js'))
.filter('unique', require('./unique.js'));;
