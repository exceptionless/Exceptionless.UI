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

    function getById(id, options, optionsCallback) {
      optionsCallback = angular.isFunction(optionsCallback) ? optionsCallback : function(o){ return o; };
      return Restangular.one('events', id).get(optionsCallback(filterService.apply(options)));
    }

    function getByReferenceId(id, options) {
      return Restangular.one('events', 'by-ref').all(id).getList(filterService.apply(options));
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
      getById: getById,
      getByReferenceId: getByReferenceId,
      getByStackId: getByStackId,
      markCritical: markCritical,
      markNotCritical: markNotCritical,
      remove: remove
    };
    return service;
  }]);
}());
