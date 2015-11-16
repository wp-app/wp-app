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
    template: require("./uploadPhoto.html"),
    bindToController: true,
    controllerAs: 'uploadPhotoCtrl',
    controller: function($scope, $log, CONFIG, $cordovaCamera, $cordovaFileTransfer, $filter, $ionicLoading, $stateParams, $ionicModal) {
      'ngInject';

      var vm = this;
      vm.getImage = getImage;
      vm.upload = upload;
      vm.open = openModal;
      vm.close = closeModal;
      vm.reset = reset;

      $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.fields = {};
      });

      function openModal() {
        $scope.modal.show();
      };

      function closeModal() {
        $scope.modal.hide();
        $scope.image = '';
      };

      function reset() {
        $scope.image = '';
      }

      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });

      function getImage(source) {

        CONFIG.camera.sourceType = source;
        CONFIG.camera.quality = 30;
        CONFIG.camera.destinationType = Camera.DestinationType.FILE_URI;
        $log.log(CONFIG.camera.destinationType);
        $cordovaCamera.getPicture(CONFIG.camera).then(function(imageData) {

          $scope.image = imageData;

        });

      }

      function upload() {

        $ionicLoading.show({
          template: $filter('translate')('uploadPhoto.uploading')
        });

        var server = encodeURI( CONFIG.camera.uploadurl );
        var image = $scope.image.substr( $scope.image.lastIndexOf('/') + 1 );

        var name = image.split("?")[0];
        var number = image.split("?")[1];

        var options      = {};
        options.fileKey  = 'appp_cam_file';
        options.fileName = $scope.image ? image : '';
        options.mimeType = 'image/jpeg';

        var params = {};
        params.description = $scope.fields.photoDescription;

        alert($scope.fields.photoDescription);

        // Attaches image to post
        params.appp_cam_post_id = $stateParams.postId;
        params.appp_action = 'this';

        // Make sure image is from app
        params.wssec = '$lkjf(842j-!lJdubDB#792';

        options.params = params;

        // if( 'Android' === device.platform ) {

        // }

        $cordovaFileTransfer.upload(server, $scope.image, options)
          .then(function(result) {
            alert('Success!');
            closeModal();
            $ionicLoading.hide();
          }, function(err) {
            alert('Error');
            $log.log(err);
            $scope.image = '';
            $ionicLoading.hide();
          }, function (progress) {
            // constant progress updates
        });

      }

    }
  };
}
