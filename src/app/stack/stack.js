(function () {
  'use strict';

  angular.module('app.stack', [
    'ngMessages',
    'ui.bootstrap',
    'ui.router',

    'dialogs.main',
    'dialogs.default-translations',

    'exceptionless.dialog',
    'exceptionless.event',
    'exceptionless.events',
    'exceptionless.feature',
    'exceptionless.filter',
    'exceptionless.organization-notifications',
    'exceptionless.notification',
    'exceptionless.rate-limit',
    'exceptionless.refresh',
    'exceptionless.stack',
    'exceptionless.stack-trace',
    'exceptionless.stat'
  ])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('app.stack', {
      url: '/stack/{id:[0-9a-fA-F]{24}}',
      controller: 'Stack',
      controllerAs: 'vm',
      templateUrl: 'app/stack/stack.tpl.html'
    });
  }]);
}());
