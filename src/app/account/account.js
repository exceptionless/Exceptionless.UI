(function () {
  'use strict';

  angular.module('app.account', [
    'directives.inputMatch',
    'ngMessages',
    'ui.router',

    'exceptionless.auth',
    'exceptionless.dialog',
    'exceptionless.project',
    'exceptionless.user'
  ])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('app.account', {
        abstract: true,
        url: '/account',
        template: '<ui-view autoscroll="true" />'
      });

      $stateProvider.state('app.account.manage', {
        url: '/manage',
        controller: 'account.Manage',
        controllerAs: 'vm',
        templateUrl: 'app/account/manage.tpl.html'
      });
    }]);
}());
