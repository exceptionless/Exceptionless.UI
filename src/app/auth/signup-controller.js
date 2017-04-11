(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Signup', function ($ExceptionlessClient, $location, $state, $stateParams, $timeout, analyticsService, authService, FACEBOOK_APPID, GOOGLE_APPID, GITHUB_APPID, LIVE_APPID, notificationService, projectService, stateService) {
      var vm = this;
      function getMessage(response) {
        var message = 'An error occurred while signing up.  Please contact support for more information.';
        if (response.data && response.data.message)
          message += ' Message: ' + response.data.message;

        return message;
      }

      function authenticate(provider) {
        function onSuccess() {
          analyticsService.completeRegistration($location.search());
          $ExceptionlessClient.createFeatureUsage(vm._source + '.authenticate').setProperty('InviteToken', vm.token).addTags(provider).submit();
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(vm._source + '.authenticate.error').setProperty('InviteToken', vm.token).setProperty('response', response).addTags(provider).submit();
          notificationService.error(getMessage(response));
        }

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

      function signup(isRetrying) {
        function resetCanSignup() {
          vm._canSignup = true;
        }

        function retry(delay) {
          var timeout = $timeout(function() {
            $timeout.cancel(timeout);
            signup(true);
          }, delay || 100);
        }

        if (!vm.signupForm || vm.signupForm.$invalid) {
          resetCanSignup();
          return !isRetrying && retry(1000);
        }

        if (!vm.user.email || vm.signupForm.$pending) {
          return retry();
        }

        if (vm._canSignup) {
          vm._canSignup = false;
        } else {
          return;
        }

        function onSuccess() {
          analyticsService.completeRegistration($location.search());
          $ExceptionlessClient.submitFeatureUsage(vm._source + '.signup');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(vm._source + '.signup.error').setUserIdentity(vm.user.email).submit();
          notificationService.error(getMessage(response));
        }

        return authService.signup(vm.user).then(onSuccess, onFailure).then(redirectOnSignup).then(resetCanSignup, resetCanSignup);
      }

      if (authService.isAuthenticated()) {
        authService.logout(true, $stateParams);
      }

      this.$onInit = function $onInit() {
        vm._source = 'app.auth.Signup';
        vm._canSignup = true;
        vm.authenticate = authenticate;
        vm.isExternalLoginEnabled = isExternalLoginEnabled;
        vm.signup = signup;
        vm.signupForm = {};
        vm.token = $stateParams.token;
        vm.user = {invite_token: vm.token};
      };
    });
}());
