(function () {
  'use strict';

  angular.module('app.auth')
    .controller('auth.Login', [function () {
      var vm = this;
      vm.user = { remember: true };
    }]);
}());
