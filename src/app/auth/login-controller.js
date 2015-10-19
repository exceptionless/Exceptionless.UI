(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Login', ['$ExceptionlessClient', '$state', '$stateParams', 'authService', 'FACEBOOK_APPID', 'GOOGLE_APPID', 'GITHUB_APPID', 'LIVE_APPID', 'notificationService', 'projectService', 'stateService', function ($ExceptionlessClient, $state, $stateParams, authService, FACEBOOK_APPID, GOOGLE_APPID, GITHUB_APPID, LIVE_APPID, notificationService, projectService, stateService) {
      var source = 'app.auth.Login';
      var vm = this;

      function getMessage(response) {
        var message = 'An error occurred while logging in. Please contact support for more information.';
        if (response.data && response.data.message)
          message += ' Message: ' + response.data.message;

        return message;
      }

      function authenticate(provider) {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.authenticate.success').setProperty('InviteToken', vm.token).submit();
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.authenticate.error').setProperty('InviteToken', vm.token).setProperty('response', response).submit();
          notificationService.error(getMessage(response));
        }

        $ExceptionlessClient.createFeatureUsage(source + '.authenticate').setProperty('InviteToken', vm.token).submit();
        return authService.authenticate(provider, { InviteToken: vm.token }).then(onSuccess, onFailure).then(redirectOnSignup);
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

      function login(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.login.success').setUserIdentity(vm.loginForm.email).submit();
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.login.error').setUserIdentity(vm.loginForm.email).submit();
          notificationService.error(getMessage(response));
        }

        $ExceptionlessClient.createFeatureUsage(source + '.login').setUserIdentity(vm.loginForm.email).submit();
        return authService.login(vm.user).then(onSuccess, onFailure).then(redirectOnSignup);
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

        return projectService.getAll({ mode: 'stats' }).then(onSuccess, onFailure);
      }

      if (authService.isAuthenticated()) {
        authService.logout();
      }

      vm.authenticate = authenticate;
      vm.isExternalLoginEnabled = isExternalLoginEnabled;
      vm.login = login;
      vm.loginForm = {};
      vm.token = $stateParams.token;
      vm.user = { invite_token: vm.token };
    }]);
}());
