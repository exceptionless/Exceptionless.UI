(function () {
  'use strict';

  angular.module('exceptionless.filter')
    .factory('filterStoreService', ['$window', 'locker', function ($window, locker) {
      var _store = locker.driver('local').namespace('filter');

      function getTimeFilter() {
        return _store.get('time');
      }

      function setTimeFilter(timeFilter) {
        _store.put('time', timeFilter);
      }

      var service = {
        getTimeFilter: getTimeFilter,
        setTimeFilter: setTimeFilter
      };

      return service;
    }]);
}());
