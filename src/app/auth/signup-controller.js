(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Signup', ['authService', 'notificationService', function (authService, notificationService) {
      if (authService.isAuthenticated()) {
        authService.logout();
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

        return authService.authenticate(provider).then(onSuccess, onFailure);
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

        return authService.signup(vm.user).then(onSuccess, onFailure);
      }

      vm.authenticate = authenticate;
      vm.signup = signup;
      vm.user = {};
    }]);
}());
