(function () {
  'use strict';

  angular.module('exceptionless.pagination', [])
    .factory('paginationService', [function () {
      function getCurrentOptions(options, previous, next) {
        if (previous && previous.page) {
          return angular.extend({}, previous, { page: parseInt(previous.page) + 1 });
        }

        if (next && next.page) {
          return angular.extend({}, next, { page: parseInt(next.page) - 1 });
        }

        return angular.extend({}, options, { page: 1 });
      }

      function getCurrentPageSummary(data, page, limit) {
        if (!page) {
          return null;
        }

        limit = limit ? parseInt(limit) : 100;

        var from = ((page - 1) * limit) + 1;
        var to = data && data.length > 0 ? from + data.length - 1 : from;

        return from + '-' + to;
      }

      var service = {
        getCurrentOptions: getCurrentOptions,
        getCurrentPageSummary: getCurrentPageSummary
      };

      return service;
    }]);
}());
