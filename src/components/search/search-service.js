(function () {
  'use strict';

  angular.module('exceptionless.search', ['restangular'])
    .factory('searchService', ['$cacheFactory', 'Restangular', function ($cacheFactory, Restangular) {
      var _cache = $cacheFactory('http:search');

      var _cachedRestangular = Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setDefaultHttpFields({ cache: _cache });
      });

      function validate(query) {
        return _cachedRestangular.one('search', 'validate').get({ query: query || '' });
      }

      var service = {
        validate: validate
      };

      return service;
    }]);
}());
