(function () {
  'use strict';

  angular.module('app')
    .controller('app.New', function (eventService) {
      var vm = this;
      this.$onInit = function $onInit() {
        vm.newest = {
          get: eventService.getAll,
          options: {
            limit: 20,
            mode: 'stack_new'
          },
          source: 'app.New'
        };
      };
    });
}());
