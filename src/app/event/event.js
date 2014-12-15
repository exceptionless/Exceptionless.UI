(function () {
  'use strict';

  angular.module('app.event', [
    'angular-filters',
    'cfp.hotkeys',
    'ngClipboard',
    'ui.router',

    'exceptionless.error',
    'exceptionless.event',
    'exceptionless.organization-notifications',
    'exceptionless.link',
    'exceptionless.notification',
    'exceptionless.object-dump',
    'exceptionless.simple-error',
    'exceptionless.simple-stack-trace',
    'exceptionless.stack-trace',
    'exceptionless.timeago',
    'exceptionless.url',
    'exceptionless.user-agent'
  ])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('app.event', {
        url: '/event/:id',
        controller: 'Event',
        controllerAs: 'vm',
        templateUrl: 'app/event/event.tpl.html'
      });
    }]);
}());
