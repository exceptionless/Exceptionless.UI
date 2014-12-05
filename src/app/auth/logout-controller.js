(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Logout', ['$auth', function ($auth) {
      if (!$auth.isAuthenticated()) {
        // TODO: Navigate to login page.
        return;
      }


      function onSuccess() {
        console.log('logged out!');
        // TODO: Navigate to login page.
      }

      function onFailure(response) {
        console.log('failed to log out: ' + response.data.message);
        // TODO: Navigate to login page??
      }

      return $auth.logout().then(onSuccess, onFailure);
    }]);
}());
