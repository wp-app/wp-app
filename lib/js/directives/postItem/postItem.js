module.exports = function() {
  return {
    restrict: 'E',
    transclude: false,
    replace: true,
    scope: {
      post: '=',
      state: '@',
      stateParams: '=',
      classes: "@"
    },
    template: require("./postItem.html"),
    bindToController: true,
    controllerAs: 'postItemCtrl',
    controller: function($scope, $log, $state, $attrs) {
      'ngInject';
      var vm = this;
      vm.showImg = angular.isDefined($attrs.showImg);
      vm.onClick = onClick;
      vm.getClasses = getClasses;

      function getClasses(){

      }

      function onClick() {
          if (!vm.state){
              return;
          }
          $state.go(vm.state, vm.stateParams);
      }
    }
  };
}
