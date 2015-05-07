(function () {
  'use strict';

  angular.module('app.account')
    .controller('account.Verify', ['$ExceptionlessClient', '$rootScope', '$state', '$stateParams', 'notificationService', 'userService', function ($ExceptionlessClient, $rootScope, $state, $stateParams, notificationService, userService) {
      var source = 'app.account.Verify';
      var _token = $stateParams.token;

      function redirect() {
        return $state.go('app.account.manage');
      }

      function verify() {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.verify.success').setProperty('Token', _token).submit();
          $rootScope.$emit('UserChanged');
          notificationService.info('Successfully verified your account.');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.verify.error').setProperty('Token', _token).setProperty('response', response).submit();
          var message = 'An error occurred while verifying your account.';
          if (response && response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        $ExceptionlessClient.createFeatureUsage(source + '.verify').setProperty('Token', _token).submit();
        return userService.verifyEmailAddress(_token).then(onSuccess, onFailure);
      }

      verify().finally(redirect);
    }]);
}());
