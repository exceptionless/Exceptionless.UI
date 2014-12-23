(function () {
  'use strict';

  angular.module('app.status')
    .controller('Status', ['$interval', '$scope', '$state', '$stateParams', 'authService', 'stateService', 'Restangular', function ($interval, $scope, $state, $stateParams, authService, stateService, Restangular) {
      var redirect = $stateParams.redirect === true;
      var vm = this;

      function updateStatus() {
        function updateMessage(response) {
          vm.message = response.status !== 0 ? response.data.message : null;
        }

        function onSuccess(response) {
          if (redirect) {
            if (!authService.isAuthenticated()) {
              return $state.go('auth.login');
            }

            return stateService.restore();
          }

          return updateMessage(response);
        }

        return Restangular.one('status').get().then(onSuccess, updateMessage);
      }

      var interval = $interval(updateStatus, 10 * 1000);
      $scope.$on('$destroy', function () {
        $interval.cancel(interval);
      });

      vm.message = null;

      updateStatus();
    }]);
}());
