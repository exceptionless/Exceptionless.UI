(function () {
  'use strict';

  angular.module('exceptionless.stat', [
    'restangular',
    'exceptionless.filter'
  ]).factory('statService', ['filterService', 'Restangular', function (filterService, Restangular) {
      function get(options, optionsCallback) {
        optionsCallback = angular.isFunction(optionsCallback) ? optionsCallback : function(o){ return o; };
        return Restangular.one('stats').get(optionsCallback(filterService.apply(options)));
      }

      function getTimeline(options, optionsCallback) {
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
