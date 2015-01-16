(function () {
  'use strict';

  angular.module('app.account', [
    'directives.inputMatch',
    'ngMessages',
    'ui.router',

    'exceptionless.auth',
    'exceptionless.billing',
    'exceptionless.dialog',
    'exceptionless.project',
    'exceptionless.user',
    'exceptionless.validators'
  ])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('app.account', {
        abstract: true,
        url: '/account',
        template: '<ui-view autoscroll="true" />'
      });

      $stateProvider.state('app.account.manage', {
        url: '/manage?projectId&tab',
        controller: 'account.Manage',
        controllerAs: 'vm',
        templateUrl: 'app/account/manage.tpl.html'
      });

      $stateProvider.state('app.account.verify', {
        url: '/verify?token',
        template: null,
        controller: 'account.Verify'
      });
    }]);
}());
