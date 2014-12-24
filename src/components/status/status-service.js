(function () {
  'use strict';

  angular.module('exceptionless.status', [
    'restangular'
  ])
  .factory('statusService', ['Restangular', function (Restangular) {
    function get() {
      return Restangular.one('status').get();
    }

    var service = {
      get: get
    };

    return service;
  }]);
}());
