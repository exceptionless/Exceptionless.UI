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
        link: function (scope) {
          var level =  scope.source && scope.source.data && scope.source.data.Level ? scope.source.data.Level.toLowerCase() : null;
          scope.isLevelSuccess = level === 'trace' || level === 'debug';
          scope.isLevelInfo = level === 'info';
          scope.isLevelWarning = level === 'warn';
          scope.isLevelError = level === 'error';

          scope.templateUrl = 'components/summary/templates/' + scope.source.template_key + '.tpl.html';
        }
      };
    }]);
}());
