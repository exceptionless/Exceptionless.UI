(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Signup', ['$state', '$timeout', 'authService', 'notificationService', 'projectService', 'stateService', function ($state, $timeout, authService, notificationService, projectService, stateService) {
      var _canSignup = true;

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
        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return authService.authenticate(provider).then(redirectOnSignup, onFailure);
      }

      function redirectOnSignup() {
        function onSuccess(response) {
          if (response.data && response.data.length > 0) {
            return stateService.restore();
          }

          stateService.clear();
          return $state.go('app.project.add');
        }

        function onFailure() {
          return stateService.restore('app.project.add');
        }

        return projectService.getAll().then(onSuccess, onFailure);
      }

      function signup() {
        function resetCanSignup() {
          _canSignup = true;
        }

        if (!vm.signupForm || vm.signupForm.$invalid) {
          resetCanSignup();
          return;
        }

        if (vm.signupForm.$pending) {
          var timeout = $timeout(function() {
            $timeout.cancel(timeout);
            signup();
          }, 100);
          return;
        }

        if (_canSignup) {
          _canSignup = false;
        } else {
          return;
        }

        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return authService.signup(vm.user).then(redirectOnSignup, onFailure).then(resetCanSignup, resetCanSignup);
      }

      vm.authenticate = authenticate;
      vm.signup = signup;
      vm.signupForm = {};
      vm.user = {};
    }]);
}());
