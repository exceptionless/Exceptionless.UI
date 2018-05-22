(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Login', function ($ExceptionlessClient, $state, $stateParams, authService, FACEBOOK_APPID, GOOGLE_APPID, GITHUB_APPID, LIVE_APPID, ENABLE_SIGNUP, notificationService, projectService, stateService) {
      var vm = this;

      function getMessage(response) {
        var message = 'An error occurred while logging in. Please contact support for more information.';
        if (response.data && response.data.message)
          message += ' Message: ' + response.data.message;

        return message;
      }

      function authenticate(provider) {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(vm._source + '.authenticate').setProperty('InviteToken', vm.token).addTags(provider).submit();
          return redirectOnSignup();
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(vm._source + '.authenticate.error').setProperty('InviteToken', vm.token).setProperty('response', response).addTags(provider).submit();
          notificationService.error(getMessage(response));
        }

        return authService.authenticate(provider, { InviteToken: vm.token }).then(onSuccess, onFailure);
      }

      function isSignupEnabled() {
        return !!ENABLE_SIGNUP;
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
          $ExceptionlessClient.submitFeatureUsage(vm._source + '.login');
          return redirectOnSignup();
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(vm._source + '.login.error').setUserIdentity(vm.user.email).submit();
          notificationService.error(getMessage(response));
        }

        return authService.login(vm.user).then(onSuccess, onFailure);
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

      this.$onInit = function $onInit() {
        vm._source = 'app.auth.Login';
        vm.authenticate = authenticate;
        vm.isExternalLoginEnabled = isExternalLoginEnabled;
        vm.isSignupEnabled = isSignupEnabled;
        vm.login = login;
        vm.loginForm = {};
        vm.token = $stateParams.token;
        vm.user = {invite_token: vm.token};
      };
    });
}());
