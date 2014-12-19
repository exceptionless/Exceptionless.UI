(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('emailAddressAvailableValidator', ['$q', 'authService', function($q, authService) {
      function emailAddressAvailable(emailAddress) {
        var deferred = $q.defer();

        authService.isEmailAddressAvailable(emailAddress).then(deferred.reject, deferred.resolve);

        return deferred.promise;
      }

      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$asyncValidators.unique = emailAddressAvailable;
        }
      };
    }]);
}());
