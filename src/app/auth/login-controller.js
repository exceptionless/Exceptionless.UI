(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Login', ['$auth', 'notificationService', function ($auth, notificationService) {
      var vm = this;

      function getMessage(response) {
        var message = 'An error occurred while logging in.';
        if (response.data && response.data.message)
          message += ' Message: ' + response.data.message;

        return message;
      }

      function authenticate(provider) {
        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return $auth.authenticate(provider).catch(onFailure);
      }

      function login(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return $auth.login(vm.user).catch(onFailure);
      }

      vm.authenticate = authenticate;
      vm.login = login;
      vm.user = { remember: true };
    }]);
}());
