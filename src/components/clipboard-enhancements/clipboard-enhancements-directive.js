(function () {
  'use strict';

  angular.module('exceptionless.clipboard-enhancements', [])
    .directive('hideOnClipboardNotSupported', ['$interval', function ($interval) {
      return {
        restrict: 'A',
        link: function (scope, element) {
          function isCommandSupported(command) {
            try {
              return document && document.queryCommandSupported && document.queryCommandSupported(command);
            } catch(e) {
              return false;
            }
          }

          if (!isCommandSupported('copy')) {
            element.hide();
          }
        }
      };
    }]);
}());
