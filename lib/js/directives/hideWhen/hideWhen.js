export default function($window) {
    'ngInject';

    return {
        link: link,
        restrict: 'A'
    };

    function link($scope, $element, $attr) {
        'ngInject';

        let debouncedCheck = ionic.debounce(() => {
            $scope.$apply(() => {
                checkExpose();
            });
        }, 300, false);
        checkExpose();
        ionic.on('resize', onResize, $window);

        $scope.$on('$destroy', function() {
            ionic.off('resize', onResize, $window);
        });

        function checkExpose() {
            let mq = $attr.hideWhenBreakpoint === 'large' ? '(min-width:768px)' : $attr.hideWhenBreakpoint;
            if (!$window.matchMedia(mq).matches) {
                $element.removeClass('ng-hide');
            } else {
                $element.addClass('ng-hide');
            }
        };

        function onResize() {
            debouncedCheck();
        };
    }
}
