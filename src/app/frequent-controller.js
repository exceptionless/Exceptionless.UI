(function () {
  'use strict';

  angular.module('app')
    .controller('app.Frequent', function (stackService) {
      var vm = this;
      this.$onInit = function $onInit() {
        vm.mostFrequent = {
          get: stackService.getFrequent,
          options: {
            limit: 20,
            mode: 'summary'
          },
          source: 'app.Frequent'
        };
      };
    });
}());
