(function () {
  'use strict';

  angular.module('exceptionless.stat', [
    'restangular',

    'exceptionless.filter'
  ])
    .factory('statService', ['filterService', 'Restangular', function (filterService, Restangular) {
      function get(options) {
        return Restangular.one('stats').get(filterService.apply(options));
      }

      function getSessions(options) {
        return Restangular.one('sessions', 'stats').get(filterService.apply(options));
      }

      function getBySessionId(id, options) {
        return Restangular.one('sessions', id).one('stats').get(filterService.apply(options));
      }

      function getByStackId(id, options) {
        return Restangular.one('stacks', id).one('stats').get(filterService.apply(options));
      }

      var service = {
        get: get,
        getSessions: getSessions,
        getBySessionId: getBySessionId,
        getByStackId: getByStackId
      };

      return service;
    }]);
}());
