(function () {
  'use strict';

  angular.module('app')
    .controller('app.Frequent', ['stackService', function (stackService) {
      var vm = this;
      vm.mostFrequent = {
        get: stackService.getFrequent,
        options: {
          limit: 20,
          mode: 'summary'
        }
      };
    }]);
}());
