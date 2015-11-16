module.exports = function() {
  return {
    restrict: 'E',
    transclude: false,
    replace: true,
    scope: {
      post: '=',
      state: '@',
      stateParams: '='
    },
    template: require("./postCard.html"),
    bindToController: true,
    controllerAs: 'postCardCtrl',
    controller: function($scope, $log, $state) {
      'ngInject';
      var vm = this;
      vm.onClick = onClick;

      function onClick() {
          if (!vm.state){
              return;
          }
          $state.go(vm.state, vm.stateParams);
      }
    }
  };
}
