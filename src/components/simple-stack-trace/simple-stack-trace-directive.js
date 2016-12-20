(function () {
  'use strict';

  angular.module('exceptionless.simple-stack-trace', [
    'ngSanitize',

    'exceptionless',
    'exceptionless.simple-error'
  ])
    .directive('simpleStackTrace', function ($ExceptionlessClient, $sanitize, $sce, simpleErrorService) {
      function buildStackFrames(exceptions) {
        var frames = '';
        for (var index = 0; index < exceptions.length; index++) {
          var stackTrace = exceptions[index].stack_trace;
          if (!!stackTrace) {
            frames += '<div class="stack-frame">' + escapeHTML(stackTrace.replace(' ', ''));

            if (index < (exceptions.length - 1)) {
              frames += '<div>--- End of inner exception stack trace ---</div>';
            }

            frames += '</div>';
          }
        }

        return frames;
      }

      function buildStackTrace(exceptions) {
        return buildStackTraceHeader(exceptions) + buildStackFrames(exceptions.reverse());
      }

      function buildStackTraceHeader(exceptions) {
        var header = '';
        for (var index = 0; index < exceptions.length; index++) {
          header += '<span class="ex-header">';

          if (index > 0) {
            header += ' ---> ';
          }

          var hasType = !!exceptions[index].type;
          if (hasType) {
            header += '<span class="ex-type">' + escapeHTML(exceptions[index].type) + '</span>: ';
          }

          if (exceptions[index].message) {
            header += '<span class="ex-message">' + escapeHTML(exceptions[index].message) + '</span>';
          }

          if (hasType) {
            header += '</span>';
          }
        }

        return header;
      }

      function escapeHTML(input) {
        if (!input || !input.replace) {
          return input;
        }

        return $sce.trustAsHtml(input
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;"));
      }

      return {
        bindToController: true,
        restrict: 'E',
        replace: true,
        scope: {
          exception: "="
        },
        template: '<pre class="stack-trace"><code ng-bind-html="vm.stackTrace"></code></pre>',
        controller: [function () {
          var vm = this;
          this.$onInit = function $onInit() {
            vm.stackTrace = $sce.trustAsHtml(buildStackTrace(simpleErrorService.getExceptions(vm.exception)));
          };
        }],
        controllerAs: 'vm'
      };
    });
}());
