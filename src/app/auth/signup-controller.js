(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Signup', ['$auth', 'notificationService', function ($auth, notificationService) {
      var vm = this;

      function getMessage(response) {
        var message = 'An error occurred while signing up.';
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

      function signup(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return $auth.signup(vm.user).catch(onFailure);
      }

      vm.authenticate = authenticate;
      vm.signup = signup;
      vm.user = {};
    }]);
}());
