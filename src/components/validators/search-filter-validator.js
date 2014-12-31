(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('searchFilterValidator', ['$q', 'searchService', function($q, searchService) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$asyncValidators.valid = function(query) {
            var deferred = $q.defer();

            if (ngModel.$pristine) {
              deferred.resolve(true);
            } else {
              searchService.validate(query).then(deferred.resolve, deferred.reject);
            }

            return deferred.promise;
          };
        }
      };
    }]);
}());
