(function () {
  'use strict';

  angular.module('exceptionless.rate-limit', [
    'restangular'
  ])
  .run(['rateLimitService', 'Restangular', function(rateLimitService, Restangular) {
    Restangular.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      console.log('addResponseInterceptor');
      rateLimitService.updateFromResponseHeader(response);
      return data;
    });
  }]);
}());
