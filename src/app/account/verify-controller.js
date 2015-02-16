(function () {
  'use strict';

  angular.module('app.account')
    .controller('account.Verify', ['$state', '$stateParams', 'notificationService', 'userService', function ($state, $stateParams, notificationService, userService) {
      var _token = $stateParams.token;

      function verify() {
        function onSuccess() {
          notificationService.info('Successfully verified your account.');
        }

        function onFailure(response) {
          var message = 'An error occurred while verifying your account.';
          if (response && response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.verifyEmailAddress(_token).then(onSuccess, onFailure);
      }

      verify().then($state.go('app.account.manage'));
    }]);
}());
