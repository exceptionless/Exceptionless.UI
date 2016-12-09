(function () {
  'use strict';

  angular.module('app')
    .controller('app.Users', function (stackService) {
      var vm = this;
      this.$onInit = function $onInit() {
        vm.mostUsers = {
          get: stackService.getUsers,
          options: {
            limit: 20,
            mode: 'summary'
          },
          source: 'app.MostUsers'
        };
      };
    });
}());
