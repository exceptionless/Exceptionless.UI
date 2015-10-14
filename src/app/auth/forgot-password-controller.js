(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.ForgotPassword', ['$ExceptionlessClient', '$state', 'authService', 'notificationService', function ($ExceptionlessClient, $state, authService, notificationService) {
      var source = 'app.auth.ForgotPassword';
      var vm = this;

      function resetPassword(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.resetPassword.success').setUserIdentity(vm.email).submit();
          notificationService.info('An email was sent that contains instructions to change your password.');
          return $state.go('auth.login');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.resetPassword.error').setUserIdentity(vm.email).setProperty('response', response).submit();
          var message = 'An error occurred while trying to reset your password.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        $ExceptionlessClient.createFeatureUsage(source + '.resetPassword').setUserIdentity(vm.email).submit();
        return authService.forgotPassword(vm.email).then(onSuccess, onFailure);
      }

      vm.email = null;
      vm.resetPassword = resetPassword;
    }]);
}());
