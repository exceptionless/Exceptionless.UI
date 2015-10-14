(function () {
  'use strict';

  angular.module('exceptionless.simple-stack-trace', [
    'ngSanitize',

    'exceptionless',
    'exceptionless.simple-error'
  ])
    .directive('simpleStackTrace', ['$ExceptionlessClient', '$sanitize', 'simpleErrorService', function ($ExceptionlessClient, $sanitize, simpleErrorService) {
      function buildStackFrames(exceptions) {
        var frames = '';
        for (var index = 0; index < exceptions.length; index++) {
          var stackTrace = exceptions[index].stack_trace;
          if (!!stackTrace) {
            frames += '<div class="stack-frame">' + sanitize(stackTrace.replace(' ', ''));

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
            header += '<span class="ex-type">' + sanitize(exceptions[index].type) + '</span>: ';
          }

          if (exceptions[index].message) {
            header += '<span class="ex-message">' + sanitize(exceptions[index].message) + '</span>';
          }

          if (hasType) {
            header += '</span>';
          }
        }

        return header;
      }

      function sanitize(input) {
        try {
          return $sanitize(input.replace('<', '&lt;'));
        } catch (e) {
          $ExceptionlessClient.createException(e).addTags('sanitize').submit();
        }

        return input;
      }

      return {
        bindToController: true,
        restrict: 'E',
        replace: true,
        scope: {
          exception: "="
        },
        template: '<pre class="stack-trace" bind-html-unsafe="vm.stackTrace"></pre>',
        controller: [function () {
          var vm = this;
          vm.stackTrace = buildStackTrace(simpleErrorService.getExceptions(vm.exception));
        }],
        controllerAs: 'vm'
      };
    }]);
}());
