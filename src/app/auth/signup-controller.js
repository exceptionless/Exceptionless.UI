(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Signup', ['$auth', function ($auth) {
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

      function signup(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          console.log('signed up!');
        }

        function onFailure(response) {
          console.log('failed to signed: ' + response.data.message);
        }

        return $auth.signup(vm.user).then(onSuccess, onFailure);
      }

      vm.authenticate = authenticate;
      vm.signup = signup;
      vm.user = {};
    }]);
}());
