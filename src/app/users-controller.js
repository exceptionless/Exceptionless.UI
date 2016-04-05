(function () {
  'use strict';

  angular.module('app')
    .controller('app.Users', ['stackService', function (stackService) {
      var vm = this;
      vm.mostUsers = {
        get: stackService.getFrequent,
        options: {
          limit: 20,
          mode: 'summary'
        },
        source: 'app.MostUsers'
      };
    }]);
}());
