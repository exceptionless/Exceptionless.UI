(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Signup', ['$state', '$stateParams', '$timeout', 'authService', 'FACEBOOK_APPID', 'GOOGLE_APPID', 'GITHUB_APPID', 'LIVE_APPID', 'notificationService', 'projectService', 'stateService', function ($state, $stateParams, $timeout, authService, FACEBOOK_APPID, GOOGLE_APPID, GITHUB_APPID, LIVE_APPID, notificationService, projectService, stateService) {
      var _canSignup = true;
      var vm = this;

      function getMessage(response) {
        var message = 'An error occurred while signing up.  Please contact support for more information.';
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

      function isExternalLoginEnabled(provider) {
        if (!provider) {
          return !!FACEBOOK_APPID || !!GITHUB_APPID || !!GOOGLE_APPID || !!LIVE_APPID;
        }

        switch (provider) {
          case 'facebook':
            return !!FACEBOOK_APPID;
          case 'github':
            return !!GITHUB_APPID;
          case 'google':
            return !!GOOGLE_APPID;
          case 'live':
            return !!LIVE_APPID;
          default:
            return false;
        }
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

        if (!vm.user.email || vm.signupForm.$pending) {
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

      if (authService.isAuthenticated()) {
        authService.logout(true, $stateParams);
      }

      vm.authenticate = authenticate;
      vm.isExternalLoginEnabled = isExternalLoginEnabled;
      vm.signup = signup;
      vm.signupForm = {};
      vm.token = $stateParams.token;
      vm.user = { invite_token: vm.token };
    }]);
}());
