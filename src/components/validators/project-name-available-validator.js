(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('projectNameAvailableValidator', ['$q', 'projectService', function($q, projectService) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$asyncValidators.unique = function(name) {
            var deferred = $q.defer();

            if (ngModel.$pristine) {
              deferred.resolve(true);
            } else {
              projectService.isNameAvailable(name).then(function(response) {
                if (response.status === 201) {
                  deferred.reject('');
                } else {
                  deferred.resolve(true);
                }
              });
            }

            return deferred.promise;
          };
        }
      };
    }]);
}());
