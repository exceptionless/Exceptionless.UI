(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('organizationNameAvailableValidator', ['$q', 'organizationService', function($q, organizationService) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$asyncValidators.unique = function(name) {
            var deferred = $q.defer();

            if (ngModel.$pristine) {
              deferred.resolve(true);
            } else {
              organizationService.isNameAvailable(name).then(deferred.reject, deferred.resolve);
            }

            return deferred.promise;
          };
        }
      };
    }]);
}());
