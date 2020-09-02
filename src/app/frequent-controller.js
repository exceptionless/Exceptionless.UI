(function () {
  'use strict';

  angular.module('app')
    .controller('app.Frequent', function (eventService) {
      var vm = this;
      this.$onInit = function $onInit() {
        vm.mostFrequent = {
          get: eventService.getAll,
          options: {
            limit: 20,
            mode: 'stack_frequent'
          },
          source: 'app.Frequent'
        };
      };
    });
}());
