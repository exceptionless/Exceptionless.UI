(function () {
  'use strict';

  angular.module('exceptionless.auth', [
    'restangular',
    'satellizer',
    'ui.router',

    'exceptionless.state'
  ])
  .factory('authService', ['$auth', '$rootScope', '$state', 'stateService', 'Restangular', function ($auth, $rootScope, $state, stateService, Restangular) {
    function authenticate(provider) {
      function onSuccess() {
        $rootScope.$emit('auth:login', {});
      }

      return $auth.authenticate(provider).then(onSuccess);
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
        $rootScope.$emit('auth:login', {});
      }

      return $auth.login(user).then(onSuccess);
    }

    function logout(withRedirect) {
      function onSuccess() {
        $rootScope.$emit('auth:logout', {});

        if (withRedirect) {
          stateService.save(['auth.']);
          return $state.go('auth.login');
        }
      }

      stateService.clear();
      return $auth.logout().then(onSuccess);
    }

    function resetPassword(resetPasswordModel) {
      return Restangular.one('auth', 'reset-password').customPOST(resetPasswordModel);
    }

    function signup(user) {
      return $auth.signup(user);
    }

    function unlink(providerName, providerUserId) {
      return $auth.unlink(providerName + '/' + providerUserId);
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
