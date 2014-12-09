(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Login', ['authService', 'notificationService', function (authService, notificationService) {
      if (authService.isAuthenticated()) {
        authService.logout();
      }

      var vm = this;

      function getMessage(response) {
        var message = 'An error occurred while logging in.';
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

      function login(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          return authService.redirectToPreviousState();
        }

        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return authService.login(vm.user).then(onSuccess, onFailure);
      }

      vm.authenticate = authenticate;
      vm.login = login;
      vm.user = { remember: true };
    }]);
}());
