(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('projectNameAvailableValidator', function($timeout, $q, projectService) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$asyncValidators.unique = function(name) {
            var deferred = $q.defer();

            if (ngModel.$pristine) {
              $timeout(function() {
                deferred.resolve(true);
              }, 0);
            } else {
              projectService.isNameAvailable(name).then(function(response) {
                if (response.status === 201) {
                  deferred.reject('');
                } else {
                  deferred.resolve(true);
                }
              }, function() {
                deferred.reject('An error occurred while validating the project name.');
              });
            }

            return deferred.promise;
          };
        }
      };
    });
}());
