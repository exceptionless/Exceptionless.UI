(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('organizationNameAvailableValidator', ['$q', 'organizationService', function($q, organizationService) {
      function organizationNameAvailable(name) {
        var deferred = $q.defer();

        organizationService.isNameAvailable(name).then(deferred.reject, deferred.resolve);

        return deferred.promise;
      }

      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$asyncValidators.unique = organizationNameAvailable;
        }
      };
    }]);
}());
