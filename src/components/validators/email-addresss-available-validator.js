(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('emailAddressAvailableValidator', ['$q', 'authService', function($q, authService) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$asyncValidators.unique = function(emailAddress) {
            var deferred = $q.defer();

            if (ngModel.$pristine) {
              deferred.resolve(true);
            } else {
              authService.isEmailAddressAvailable(emailAddress).then(deferred.reject, deferred.resolve);
            }

            return deferred.promise;
          };
        }
      };
    }]);
}());
