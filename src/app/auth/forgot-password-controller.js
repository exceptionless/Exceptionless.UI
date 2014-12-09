(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.ForgotPassword', ['$state', 'authService', 'notificationService', function ($state, authService, notificationService) {
      var vm = this;

      function resetPassword(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          notificationService.info('An email was sent that contains instructions to change your password.');
          return $state.go('auth.login');
        }

        function onFailure(response) {
          var message = 'An error occurred while trying to reset your password.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return authService.forgotPassword(vm.email).then(onSuccess, onFailure);
      }

      var vm = this;
      vm.email = null;
      vm.resetPassword = resetPassword;
    }]);
}());
