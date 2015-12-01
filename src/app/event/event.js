(function () {
  'use strict';

  angular.module('app.event', [
    'angular-filters',
    'cfp.hotkeys',
    'ngClipboard',
    'ui.router',

    'exceptionless',
    'exceptionless.error',
    'exceptionless.event',
    'exceptionless.events',
    'exceptionless.organization-notifications',
    'exceptionless.link',
    'exceptionless.notification',
    'exceptionless.object-dump',
    'exceptionless.simple-error',
    'exceptionless.simple-stack-trace',
    'exceptionless.stack-trace',
    'exceptionless.timeago',
    'exceptionless.url'
  ])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('app.event', {
        url: '/event/{id:[0-9a-fA-F]{24}}?tab',
        controller: 'Event',
        controllerAs: 'vm',
        templateUrl: 'app/event/event.tpl.html'
      });

      $stateProvider.state('app.event-reference', {
        url: '/event/by-ref/{referenceId:.{8,100}}',
        controller: 'Reference',
        controllerAs: 'vm',
        templateUrl: 'app/event/reference.tpl.html'
      });
    }]);
}());
