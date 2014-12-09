(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.ResetPassword', ['$state', '$stateParams', 'authService', 'notificationService', function ($state, $stateParams, authService, notificationService) {
      var vm = this;

      function changePassword(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          notificationService.info('You have successfully changed your password.');
          return $state.go('auth.login');
        }

        function onFailure(response) {
          var message = 'An error occurred while trying to change your password.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return authService.resetPassword(vm.data).then(onSuccess, onFailure);
      }

      vm.changePassword = changePassword;
      vm.data = { password_reset_token: $stateParams.token };
    }]);
}());
