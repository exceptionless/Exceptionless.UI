(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Login', ['$auth', function ($auth) {
      var vm = this;

      function authenticate(provider) {
        function onSuccess() {
          console.log('authenticated!');
        }

        function onFailure(response) {
          console.log('failed to authenticate: ' + response.data.message);
        }

        return $auth.authenticate(provider).then(onSuccess, onFailure);
      }

      function login(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          console.log('logged in!');
        }

        function onFailure(response) {
          console.log('failed to login: ' + response.data.message);
        }

        return $auth.login(vm.user).then(onSuccess, onFailure);
      }

      vm.authenticate = authenticate;
      vm.login = login;
      vm.user = { remember: true };
    }]);
}());
