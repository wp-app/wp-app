module.exports = function ($log, $q, $ionicModal, $rootScope ) {
    'ngInject';

    var modal = null;
    return {
      open: open,
      close: close
    };

    

    function open() {

      $log.log('Open modal');

    }

    function close() {
      $log.log('Close modal');
      modal.hide();
    }
  }