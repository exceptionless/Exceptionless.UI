(function () {
  'use strict';

  angular.module('exceptionless.release-notification', [
    'exceptionless.refresh'
  ])
  .directive('releaseNotification', [function() {
    return {
      restrict: 'E',
      templateUrl: "components/release-notification/release-notification-directive.tpl.html",
      controller: ['$window', function($window) {
        var vm = this;

        function processNotification(notification) {
          if (notification && notification.critical) {
            $window.location.reload();
          }
        }

        vm.processNotification = processNotification;
      }],
      controllerAs: 'vm'
    };
  }]);
}());

