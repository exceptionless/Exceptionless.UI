(function () {
  'use strict';

  angular.module('app.status')
    .controller('Status', ['$interval', '$scope', '$state', '$stateParams', 'authService', 'stateService', 'statusService', 'Restangular', function ($interval, $scope, $state, $stateParams, authService, stateService, statusService, Restangular) {
      var redirect = !!$stateParams.redirect;
      var vm = this;

      function updateStatus() {
        function updateMessage(response) {
          vm.message = response.status !== 0 ? response.data.message : null;
        }

        function onSuccess(response) {
          console.log(redirect);
          if (redirect) {
            if (!authService.isAuthenticated()) {
              return $state.go('auth.login');
            }

            return stateService.restore();
          }

          return updateMessage(response);
        }

        return statusService.get().then(onSuccess, updateMessage);
      }

      var interval = $interval(updateStatus, 10 * 1000);
      $scope.$on('$destroy', function () {
        $interval.cancel(interval);
      });

      vm.message = null;

      updateStatus();
    }]);
}());
