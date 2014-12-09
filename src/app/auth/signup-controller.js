(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Signup', ['$auth', 'authService', 'notificationService', function ($auth, authService, notificationService) {
      if ($auth.isAuthenticated()) {
        authService.clearPreviousState();
        $auth.logout();
      }

      var vm = this;

      function getMessage(response) {
        var message = 'An error occurred while signing up.';
        if (response.data && response.data.message)
          message += ' Message: ' + response.data.message;

        return message;
      }

      function authenticate(provider) {
        function onSuccess() {
          return authService.redirectToPreviousState();
        }

        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return $auth.authenticate(provider).then(onSuccess, onFailure);
      }

      function signup(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          return authService.redirectToPreviousState();
        }

        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return $auth.signup(vm.user).then(onSuccess, onFailure);
      }

      vm.authenticate = authenticate;
      vm.signup = signup;
      vm.user = {};
    }]);
}());
