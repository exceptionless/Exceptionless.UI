(function () {
  'use strict';

  angular.module('app.status', [
    'ui.router',

    'exceptionless.auth',
    'exceptionless.state',
    'exceptionless.status'
  ])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('status', {
      url: '/status?redirect',
      controller: 'Status',
      controllerAs: 'vm',
      templateUrl: 'app/status/status.tpl.html'
    });
  }]);
}());
