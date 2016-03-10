(function () {
  'use strict';

  angular.module('exceptionless.stat', [
    'restangular',
    'exceptionless.filter'
  ]).factory('statService', ['filterService', 'Restangular', function (filterService, Restangular) {
      function get(fields, optionsCallback) {
        var options = (fields && fields.length > 0) ? { fields: fields } : {};
        optionsCallback = angular.isFunction(optionsCallback) ? optionsCallback : function(o){ return o; };
        return Restangular.one('stats').get(optionsCallback(filterService.apply(options)));
      }

      function getTimeline(fields, optionsCallback) {
        var options = (fields && fields.length > 0) ? { fields: fields } : {};
        optionsCallback = angular.isFunction(optionsCallback) ? optionsCallback : function(o){ return o; };
        return Restangular.one('stats', 'timeline').get(optionsCallback(filterService.apply(options)));
      }

      var service = {
        get: get,
        getTimeline: getTimeline
      };

      return service;
    }]);
}());
