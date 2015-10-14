(function () {
  'use strict';

  angular.module('app')
    .controller('app.Recent', ['eventService', function (eventService) {
      var vm = this;
      vm.mostRecent = {
        get: eventService.getAll,
        options: {
          limit: 20,
          mode: 'summary'
        },
        source: 'app.Recent'
      };
    }]);
}());
