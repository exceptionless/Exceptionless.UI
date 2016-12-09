(function () {
  'use strict';

  angular.module('app.account')
    .controller('account.Verify', function ($ExceptionlessClient, $rootScope, $state, $stateParams, notificationService, userService) {
      var vm = this;

      function redirect() {
        return $state.go('app.account.manage');
      }

      function verify() {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(vm._source + '.verify.success').setProperty('Token', vm._token).submit();
          $rootScope.$emit('UserChanged');
          notificationService.info('Successfully verified your account.');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(vm._source + '.verify.error').setProperty('Token', vm._token).setProperty('response', response).submit();
          var message = 'An error occurred while verifying your account.';
          if (response && response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        $ExceptionlessClient.createFeatureUsage(vm._source + '.verify').setProperty('Token', vm._token).submit();
        return userService.verifyEmailAddress(vm._token).then(onSuccess, onFailure);
      }

      this.$onInit = function $onInit() {
        vm._source = 'app.account.Verify';
        vm._token = $stateParams.token;

        verify().finally(redirect);
      };
    });
}());
