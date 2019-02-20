(function () {
  'use strict';

  angular.module('exceptionless.status', [
    'restangular'
  ])
  .factory('statusService', function (Restangular, BASE_URL) {
    function get() {
      return Restangular.oneUrl('HealthChecks', BASE_URL + '/health').get();
    }

    var service = {
      get: get
    };

    return service;
  });
}());
