(function () {
  'use strict';

  angular.module('exceptionless.semver', [])
    .directive('semver', function ($timeout) {
      return {
        restrict: 'A',
        scope: false,
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
          modelCtrl.$parsers.push(function (inputValue) {
            if (!inputValue) {
              return inputValue;
            }

            var r = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
            if (!r.test(inputValue)) {
              return inputValue;
            }

            // convert 4 part version to semver (1.2.3.4 to 1.2.3-4)
            var transformedInput = inputValue.replace(r, '$1.$2.$3-$4');
            if (transformedInput !== inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
            }
            return transformedInput;
          });
        }
      };
    });
}());
