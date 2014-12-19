(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('projectNameAvailableValidator', ['$q', 'projectService', function($q, projectService) {
      function projectNameAvailable(name) {
        var deferred = $q.defer();

        projectService.isNameAvailable(name).then(deferred.reject, deferred.resolve);

        return deferred.promise;
      }

      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$asyncValidators.unique = projectNameAvailable;
        }
      };
    }]);
}());
