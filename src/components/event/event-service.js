(function () {
  'use strict';

  angular.module('exceptionless.event', [
    'restangular',

    'exceptionless.filter'
  ])
  .factory('eventService', function (filterService, Restangular) {
    function calculateAveragePerHour(total, minDate, maxDate) {
      if (!minDate || !maxDate) {
        return 0.0;
      }

      var min = moment.utc(minDate);
      var max = moment.utc(maxDate);
      if (!min.isValid() || min.year() < 1 || !max.isValid() || max.year() < 1) {
        return 0.0;
      }

      return total / max.diff(min, 'hours', true);
    }

    function count(aggregations, optionsCallback) {
      var options = (aggregations && aggregations.length > 0) ? { aggregations: aggregations } : {};
      optionsCallback = angular.isFunction(optionsCallback) ? optionsCallback : function(o){ return o; };
      return Restangular.one('events', 'count').get(optionsCallback(filterService.apply(options)));
    }

    function getAll(options, optionsCallback) {
      optionsCallback = angular.isFunction(optionsCallback) ? optionsCallback : function(o){ return o; };
      return Restangular.all('events').getList(optionsCallback(filterService.apply(options)));
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

    function getBySessionId(id, options, optionsCallback) {
      optionsCallback = angular.isFunction(optionsCallback) ? optionsCallback : function(o){ return o; };
      return Restangular.one('events', 'sessions').all(id).getList(optionsCallback(filterService.apply(options)));
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
      calculateAveragePerHour: calculateAveragePerHour,
      count: count,
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
  });
}());
