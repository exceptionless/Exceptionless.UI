(function () {
  'use strict';

  angular.module('exceptionless.refresh', [
    'debounce',
    'exceptionless.throttle'
  ])
  .directive('refreshOn', ['$parse', '$rootScope', 'debounce', 'throttle', function ($parse, $rootScope, debounce, throttle) {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        function runActionOnEvent(name, action, refreshIf) {
          var unbind = $rootScope.$on(name, function (event, data) {
            if (refreshIf && !scope.$eval(refreshIf)) {
              return;
            }

            action(scope, data);
          });

          scope.$on('$destroy', unbind);
        }

        if (!attrs.refreshAction) {
          return;
        }

        var action = $parse(attrs.refreshAction);
        if (attrs.refreshDebounce) {
          action = debounce(action, attrs.refreshDebounce, true);
        } else if (attrs.refreshThrottle) {
          action = throttle(action, attrs.refreshThrottle, true);
        }

        if (attrs.refreshOn) {
          angular.forEach(attrs.refreshOn.split(" "), function (name) {
            runActionOnEvent(name, action, attrs.refreshIf);
          });
        }

        if (attrs.refreshAlways) {
          angular.forEach(attrs.refreshAlways.split(" "), function (name) {
            runActionOnEvent(name, action);
          });
        }
      }
    };
  }]);
}());
