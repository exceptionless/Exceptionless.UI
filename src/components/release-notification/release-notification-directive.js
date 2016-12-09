(function () {
  'use strict';

  angular.module('exceptionless.release-notification', [
    'exceptionless.refresh'
  ])
  .directive('releaseNotification', [function() {
    return {
      restrict: 'E',
      templateUrl: "components/release-notification/release-notification-directive.tpl.html",
      controller: function($window) {
        var vm = this;
        function processNotification(notification) {
          if (notification && notification.critical) {
            $window.location.reload();
          }
        }

        this.$onInit = function $onInit() {
          vm.processNotification = processNotification;
        };
      },
      controllerAs: 'vm'
    };
  }]);
}());

