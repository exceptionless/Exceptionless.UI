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
            
            var z = /^(\d+)\.(\d+)\.?(\d+)?\.?(\d)?$/;
            var result = '';
            if (z.test(inputValue))
            {
              var z2 = /^(\d+)\.(\d+)$/;
              if (z2.test(inputValue))
                  result = inputValue.replace(z2, '$1.$2.0-0');
              else 
              {
                var z3 = /^(\d+)\.(\d+)\.(\d+)$/;
                if (z3.test(inputValue))
                    result = inputValue.replace(z3, '$1.$2.$3-0');
                else {
                  var z4 = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
                  if (z4.test(inputValue))
                    result = inputValue.replace(z4, '$1.$2.$3-$4');                
              }
                
              if (result !== '')
              {
                 modelCtrl.$setViewValue(result);
                 modelCtrl.$render();
                 return result;
              }              
            }
              
            return inputValue;
          });
        }
      };
    });
}());
