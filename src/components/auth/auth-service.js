(function () {
  'use strict';

  angular.module('exceptionless.auth', [
    'restangular',
    'satellizer',
    'ui.router',

    'exceptionless',
    'exceptionless.state'
  ])
  .factory('authService', ['$auth', '$ExceptionlessClient', '$rootScope', '$state', 'stateService', 'Restangular', function ($auth, $ExceptionlessClient, $rootScope, $state, stateService, Restangular) {
    function authenticate(provider, userData) {
      function onSuccess() {
        $rootScope.$emit('auth:login', {});
      }

      return $auth.authenticate(provider, userData || {}).then(onSuccess);
    }

    function cancelResetPassword(resetToken) {
      return Restangular.one('auth', 'cancel-reset-password').one(resetToken).post();
    }

    function changePassword(changePasswordModel) {
      return Restangular.one('auth', 'change-password').customPOST(changePasswordModel);
    }

    function forgotPassword(email) {
      return Restangular.one('auth', 'forgot-password').one(email).get();
    }

    function getToken() {
      return $auth.getToken();
    }

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

    function isEmailAddressAvailable(email) {
      return Restangular.one('auth', 'check-email-address').one(email).get();
    }

    function login(user) {
      function onSuccess() {
         $ExceptionlessClient.config.setUserIdentity({ identity: user.email, data: { InviteToken: user.invite_token }});
         $rootScope.$emit('auth:login', {});
      }

      return $auth.login(user).then(onSuccess);
    }

    function logout(withRedirect, params) {
      function onSuccess() {
        $ExceptionlessClient.config.setUserIdentity();
        $rootScope.$emit('auth:logout', {});

        if (withRedirect) {
          stateService.save(['auth.']);
          return $state.go('auth.login', params);
        }
      }

      stateService.clear();
      return $auth.logout().then(onSuccess);
    }

    function resetPassword(resetPasswordModel) {
      return Restangular.one('auth', 'reset-password').customPOST(resetPasswordModel);
    }

    function signup(user) {
      function onSuccess(response) {
        $auth.setToken(response);
        return response;
      }

      return $auth.signup(user).then(onSuccess);
    }

    function unlink(providerName, providerUserId) {
      return Restangular.one('auth', 'unlink').one(providerName).customPOST(providerUserId);
    }

    var service = {
      authenticate: authenticate,
      cancelResetPassword: cancelResetPassword,
      changePassword: changePassword,
      forgotPassword: forgotPassword,
      getToken: getToken,
      isAuthenticated: isAuthenticated,
      isEmailAddressAvailable: isEmailAddressAvailable,
      login: login,
      logout: logout,
      resetPassword: resetPassword,
      signup: signup,
      unlink: unlink
    };

    return service;
  }]);
}());
