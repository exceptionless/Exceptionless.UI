(function () {
  'use strict';

  angular.module('exceptionless.event', [
    'restangular',

    'exceptionless.filter'
  ])
  .factory('eventService', ['filterService', 'Restangular', function (filterService, Restangular) {
    function getAll(options) {
      return Restangular.all('events').getList(filterService.apply(options));
    }

    function getAllSessions(options) {
      return Restangular.one('events').all('sessions').getList(filterService.apply(options));
    }

    function getById(id, options, optionsCallback) {
      optionsCallback = angular.isFunction(optionsCallback) ? optionsCallback : function(o){ return o; };
      return Restangular.one('events', id).get(optionsCallback(filterService.apply(options)));
    }

    function getByReferenceId(id, options) {
      return Restangular.one('events', 'by-ref').all(id).getList(filterService.apply(options));
    }

    function getBySessionId(id, options) {
      return Restangular.one('events', 'sessions').all(id).getList(filterService.apply(options));
    }

    function getByStackId(id, options) {
      return Restangular.one('stacks', id).all('events').getList(filterService.apply(options));
    }

    function markCritical(id) {
      return Restangular.one('events', id).one('mark-critical').post();
    }

    function markNotCritical(id) {
      return Restangular.one('events', id).one('mark-critical').remove();
    }

    function remove(id) {
      return Restangular.one('events', id).remove();
    }

    var service = {
      getAll: getAll,
      getAllSessions: getAllSessions,
      getById: getById,
      getByReferenceId: getByReferenceId,
      getBySessionId: getBySessionId,
      getByStackId: getByStackId,
      markCritical: markCritical,
      markNotCritical: markNotCritical,
      remove: remove
    };
    return service;
  }]);
}());
