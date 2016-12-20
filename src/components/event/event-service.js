(function () {
  'use strict';

  angular.module('exceptionless.event', [
    'restangular',

    'exceptionless.filter',
    'exceptionless.objectid'
  ])
  .factory('eventService', function (filterService, objectIDService, Restangular) {
    function calculateAveragePerHour(total, organizations) {
      function getCreationDateFromFilterOrOrganizations(organizations) {
        var date = objectIDService.getDate(filterService.getOrganizationId() || filterService.getProjectId());
        if (!date && organizations.length > 1) {
          date = new Date(organizations.reduce(function(o1, o2) { return Math.min(objectIDService.create(o1.id).timestamp, objectIDService.create(o2.id).timestamp); }) * 1000);
        }

        if (!date && organizations.length === 1) {
          date = objectIDService.getDate(organizations[0].id);
        }

        return date ? moment(date).subtract(3, 'days') : moment(new Date(2012, 1, 1));
      }

      var absoluteMinEventDate = getCreationDateFromFilterOrOrganizations(organizations || []);
      var range = filterService.getTimeRange();
      range.start = moment.max([range.start, absoluteMinEventDate].filter(function(d){ return !!d; }));
      range.end = range.end || moment();

      var result = total / range.end.diff(range.start, 'hours', true);
      return !isNaN(parseFloat(result)) && isFinite(result) ? result : 0.0;
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
