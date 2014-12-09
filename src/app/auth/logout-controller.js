(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Logout', ['$state', 'authService', function ($state, authService) {
      if (authService.isAuthenticated()) {
        authService.logout();
      }

      $state.go('auth.login');
    }]);
}());
