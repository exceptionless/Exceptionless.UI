(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.ResetPassword', ['$ExceptionlessClient', '$state', '$stateParams', 'authService', 'notificationService', function ($ExceptionlessClient, $state, $stateParams, authService, notificationService) {
      var source = 'app.auth.ResetPassword';
      var _cancelResetToken = $stateParams.cancel === 'true';
      var _resetToken = $stateParams.token;
      var vm = this;

      function changePassword(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.changePassword.success').setProperty('ResetToken', _resetToken).submit();
          notificationService.info('You have successfully changed your password.');
          return $state.go('auth.login');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.changePassword.error').setProperty('ResetToken', _resetToken).setProperty('response', response).submit();
          var message = 'An error occurred while trying to change your password.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        $ExceptionlessClient.createFeatureUsage(source + '.changePassword').setProperty('ResetToken', _resetToken).submit();
        return authService.resetPassword(vm.data).then(onSuccess, onFailure);
      }

      function cancelResetPassword() {
        function redirectToLoginPage() {
          return $state.go('auth.login');
        }

        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.cancelResetPassword.success').setProperty('ResetToken', _resetToken).submit();
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.cancelResetPassword.error').setProperty('ResetToken', _resetToken).setProperty('response', response).submit();
        }

        $ExceptionlessClient.createFeatureUsage(source + '.cancelResetPassword').setProperty('ResetToken', _resetToken).submit();
        return authService.cancelResetPassword(_resetToken).then(onSuccess, onFailure).then(redirectToLoginPage, redirectToLoginPage);
      }

      vm.changePassword = changePassword;
      vm.data = { password_reset_token: _resetToken };

      if (_cancelResetToken) {
        cancelResetPassword();
      }
    }]);
}());
