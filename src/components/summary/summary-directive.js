(function () {
  'use strict';

  angular.module('exceptionless.summary', ['exceptionless.truncate'])
    .directive('summary', [function () {
      return {
        restrict: 'E',
        scope: {
          source: '=',
          showType: '='
        },
        template: '<ng-include src="templateUrl" />',
        link: function (scope, element, attrs) {
          var level =  scope.source && scope.source.data.level ? scope.source.data.level.toLowerCase() : null;
          scope.isLevelSuccess = level === 'trace' || level === 'debug';
          scope.isLevelInfo = level === 'info';
          scope.isLevelWarning = level === 'warn';
          scope.isLevelError = level === 'error';

          scope.templateUrl = 'components/summary/templates/' + scope.source.template_key + '.tpl.html';
        }
      };
    }]);
}());
