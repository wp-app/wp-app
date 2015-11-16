module.exports = function($scope, $rootScope, CONFIG) {
  'ngInject';

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
  $rootScope.exposeAsideWhen = CONFIG.exposeAsideWhen;

}
