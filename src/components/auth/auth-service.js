(function () {
  'use strict';

  angular.module('exceptionless.auth')
    .factory('authService', ['$auth', '$location', '$rootScope', '$state', 'Restangular', 'locker', function ($auth, $location, $rootScope, $state, Restangular, locker) {
      var _store = locker.driver('session').namespace('auth');

      function authenticate(provider) {
        return $auth.authenticate(provider);
      }

      function changePassword(changePasswordModel) {
        return Restangular.one('auth', 'change-password').customPOST(changePasswordModel);
      }

      function clearPreviousState() {
        _store.forget(['name', 'params']);
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
        function onSuccess(response) {
          $rootScope.$emit('auth:login');
          return response;
        }

        return $auth.login(user).then(onSuccess);
      }

      function logout() {
        clearPreviousState();

        function onSuccess(response) {
          $rootScope.$emit('auth:logout');
          return response;
        }

        return $auth.logout().then(onSuccess);
      }

      function redirectToPreviousState() {
        var name = _store.pull('name');
        var params = _store.pull('params') || {};

        if (name) {
          return $state.go(name, params);
        }

        return $location.path('/');
      }

      function resetPassword(resetPasswordModel) {
        return Restangular.one('auth', 'reset-password').customPOST(resetPasswordModel);
      }

      function saveCurrentState() {
        if (_store.has('name')) {
          return;
        }

        _store.put('name', $state.current.name);
        _store.put('params', $state.params);
      }

      function signup(user) {
        return $auth.signup(user);
      }

      function unlink(providerName, providerUserId) {
        return $auth.unlink(providerName + '/' + providerUserId);
      }

      function verifyEmailAddress(token) {
        return Restangular.one('auth', 'verify-email-address').one(token).get();
      }

      var service = {
        authenticate: authenticate,
        changePassword: changePassword,
        forgotPassword: forgotPassword,
        getToken: getToken,
        isAuthenticated: isAuthenticated,
        isEmailAddressAvailable: isEmailAddressAvailable,
        login: login,
        logout: logout,
        redirectToPreviousState: redirectToPreviousState,
        resetPassword: resetPassword,
        saveCurrentState: saveCurrentState,
        signup: signup,
        unlink: unlink,
        verifyEmailAddress: verifyEmailAddress
      };

      return service;
    }]);
}());
