(function () {
  'use strict';

  angular.module('app')
    .controller('app.Users', function (eventService) {
      var vm = this;
      this.$onInit = function $onInit() {
        vm.mostUsers = {
          get: eventService.getAll,
          options: {
            limit: 20,
            mode: 'stack_users'
          },
          source: 'app.MostUsers'
        };
      };
    });
}());
