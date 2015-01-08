(function () {
  'use strict';

  angular.module('app.project', [
    'ngMessages',
    'ui.bootstrap',
    'ui.router',

    'dialogs.main',
    'dialogs.default-translations',
    'xeditable',

    'exceptionless.billing',
    'exceptionless.dialog',
    'exceptionless.organization-notifications',
    'exceptionless.project',
    'exceptionless.organization',
    'exceptionless.notification',
    'exceptionless.refresh',
    'exceptionless.token',
    'exceptionless.validators'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider) {
    $stateProvider.state('app.project', {
      abstract: true,
      url: '/project',
      template: '<ui-view autoscroll="true" />'
    });

    $stateProvider.state('app.project.add', {
      url: '/add?organizationId',
      controller: 'project.Add',
      controllerAs: 'vm',
      templateUrl: 'app/project/add.tpl.html'
    });

    $stateProvider.state('app.project.configure', {
      url: '/:id/configure?redirect',
      controller: 'project.Configure',
      controllerAs: 'vm',
      templateUrl: 'app/project/configure.tpl.html'
    });

    $stateProvider.state('app.project.list', {
      url: '/list',
      controller: 'project.List',
      controllerAs: 'vm',
      templateUrl: 'app/project/list.tpl.html'
    });

    $stateProvider.state('app.project.manage', {
      url: '/:id/manage',
      controller: 'project.Manage',
      controllerAs: 'vm',
      templateUrl: 'app/project/manage/manage.tpl.html'
    });
  }]);
}());
