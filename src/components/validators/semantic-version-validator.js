(function () {
  'use strict';

  angular.module('exceptionless.validators')
    .directive('semanticVersionValidator', ['$timeout', '$q', 'searchService', function($timeout, $q, searchService) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          ngModel.$validators.semver = function (modelValue, viewValue) {
            if (typeof viewValue !== 'string' || viewValue.length > 256) {
              return false;
            }

            var regex = new RegExp('^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][a-zA-Z0-9-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][a-zA-Z0-9-]*))*))?(?:\\+([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?$');
            return regex.test(viewValue);
          };
        }
      };
    }]);
}());
