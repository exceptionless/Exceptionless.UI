(function () {
  'use strict';

  angular.module('app.status')
    .controller('Status', ['$interval', '$scope', '$state', '$stateParams', 'authService', 'stateService', 'statusService', 'Restangular', function ($interval, $scope, $state, $stateParams, authService, stateService, statusService, Restangular) {
      var lastChecked = moment();
      var message = null;
      var redirect = !!$stateParams.redirect;
      var vm = this;

      function getMessage() {
        if (redirect) {
          return "We're sorry but the website is currently undergoing maintenance. You’ll be automatically redirected when the the maintenance is completed. Please contact support for more information.";
        }

        if (!!message) {
          return message;
        }

        return "We're sorry but the website is currently undergoing maintenance. Please contact support for more information.";
      }

      function updateStatus() {
        function updateMessage(response) {
          if (response && response.data && response.data.message) {
            message = response.data.message;
            if (response.status !== 200) {
              message += ' Please contact support for more information.';
            }
          } else {
            message = null;
          }
        }

        function onSuccess(response) {
          if (redirect && moment().diff(lastChecked, 'seconds') > 30) {
            if (!authService.isAuthenticated()) {
              return $state.go('auth.login');
            }

            return stateService.restore();
          }


          return updateMessage(response);
        }

        return statusService.get().then(onSuccess, updateMessage);
      }

      var interval = $interval(updateStatus, 30 * 1000);
      $scope.$on('$destroy', function () {
        $interval.cancel(interval);
      });


      vm.getMessage = getMessage;
      updateStatus();
    }]);
}());
