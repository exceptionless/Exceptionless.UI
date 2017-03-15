(function () {
  'use strict';

  angular.module('app')
    .controller('app.New', function (stackService) {
      var vm = this;
      this.$onInit = function $onInit() {
        vm.newest = {
          get: stackService.getNew,
          options: {
            limit: 20,
            mode: 'summary'
          },
          source: 'app.New'
        };
      };
    });
}());
