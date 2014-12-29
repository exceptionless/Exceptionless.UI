(function () {
  'use strict';

  angular.module('exceptionless.rate-limit')
    .directive('rateLimit', [function() {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          organizationId: '=',
          ignoreFree: '=',
          ignoreConfigureProjects: '='
        },
        templateUrl: "components/rate-limit/rate-limit-directive.tpl.html",
        controller: ['rateLimitService', function(rateLimitService) {
          function rateLimitExceeded() {
            return rateLimitService.rateLimitExceeded();
          }

          var vm = this;
          vm.rateLimitExceeded = rateLimitExceeded;
        }],
        controllerAs: 'vm'
      };
    }]);
}());

