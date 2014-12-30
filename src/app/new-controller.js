(function () {
  'use strict';

  angular.module('app')
    .controller('app.New', ['stackService', function (stackService) {
      var vm = this;
      vm.newest = {
        get: stackService.getNew,
        options: {
          limit: 20,
          mode: 'summary'
        }
      };
    }]);
}());
