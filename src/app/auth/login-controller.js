(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Login', ['$state', '$stateParams', 'authService', 'notificationService', 'projectService', 'stateService', function ($state, $stateParams, authService, notificationService, projectService, stateService) {
      var vm = this;

      function getMessage(response) {
        var message = 'An error occurred while logging in. Please contact support for more information.';
        if (response.data && response.data.message)
          message += ' Message: ' + response.data.message;

        return message;
      }

      function authenticate(provider) {
        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return authService.authenticate(provider, { InviteToken: vm.token }).then(redirectOnSignup, onFailure);
      }

      function login(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure(response) {
          notificationService.error(getMessage(response));
        }

        return authService.login(vm.user).then(redirectOnSignup, onFailure);
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

      if (authService.isAuthenticated()) {
        authService.logout();
      }

      vm.authenticate = authenticate;
      vm.login = login;
      vm.token = $stateParams.token;
      vm.user = { invite_token: vm.token };
    }]);
}());
