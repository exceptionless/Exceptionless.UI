(function () {
  'use strict';

  angular.module('exceptionless.filter')
    .factory('filterStoreService', ['$window', 'locker', function ($window, locker) {
      var _store = locker.driver('local').namespace('filter');

      function getIncludeFixed() {
        return _store.get('fixed');
      }

      function getIncludeHidden() {
        return _store.get('hidden');
      }

      function getTimeFilter() {
        return _store.get('time');
      }

      function setIncludeFixed(includeFixed) {
        _store.put('fixed', includeFixed);
      }

      function setIncludeHidden(includeHidden) {
        _store.put('hidden', includeHidden);
      }

      function setTimeFilter(timeFilter) {
        _store.put('time', timeFilter);
      }

      var service = {
        getIncludeFixed: getIncludeFixed,
        getIncludeHidden: getIncludeHidden,
        getTimeFilter: getTimeFilter,
        setIncludeFixed: setIncludeFixed,
        setIncludeHidden: setIncludeHidden,
        setTimeFilter: setTimeFilter
      };

      return service;
    }]);
}());
