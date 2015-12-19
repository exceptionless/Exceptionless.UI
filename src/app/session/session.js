(function () {
  'use strict';

  angular.module('app.session', [
      'angular-filters',
      'angular-rickshaw',
      'ui.router',

      'exceptionless',
      'exceptionless.duration',
      'exceptionless.events',
      'exceptionless.filter',
      'exceptionless.link',
      'exceptionless.notification',
      'exceptionless.pagination',
      'exceptionless.refresh',
      'exceptionless.organization-notifications',
      'exceptionless.stat',
      'exceptionless.summary',
      'exceptionless.timeago',
      'exceptionless.users'
    ])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('app.session', {
        abstract: true,
        url: '/session',
        template: '<ui-view autoscroll="true" />'
      });

      $stateProvider.state('app.session-dashboard', {
        url: '/session/dashboard',
        controller: 'session.Dashboard',
        controllerAs: 'vm',
        templateUrl: 'app/session/dashboard.tpl.html',
        onEnter: ['filterService', function (filterService) {
          filterService.setOrganizationId(null, true);
          filterService.setProjectId(null, true);
          filterService.setEventType('start', true);
        }]
      });

      $stateProvider.state('app.session-project-dashboard', {
        url: '/project/{projectId:[0-9a-fA-F]{24}}/session/dashboard',
        controller: 'session.Dashboard',
        controllerAs: 'vm',
        templateUrl: 'app/session/dashboard.tpl.html',
        onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
          filterService.setProjectId($stateParams.projectId, true);
          filterService.setEventType('start', true);
        }],
        resolve: {
          project: ['$stateParams', 'projectService', function($stateParams, projectService) {
            return projectService.getById($stateParams.projectId, true);
          }]
        }
      });

      $stateProvider.state('app.session-organization-dashboard', {
        url: '/organization/{organizationId:[0-9a-fA-F]{24}}/session/dashboard',
        controller: 'session.Dashboard',
        controllerAs: 'vm',
        templateUrl: 'app/session/dashboard.tpl.html',
        onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
          filterService.setOrganizationId($stateParams.organizationId, true);
          filterService.setEventType('start', true);
        }],
        resolve: {
          project: ['$stateParams', 'organizationService', function($stateParams, organizationService) {
            return organizationService.getById($stateParams.organizationId, true);
          }]
        }
      });

      $stateProvider.state('app.session.manage', {
        url: '/{id:[0-9a-fA-F\-]{8,100}}',
        controller: 'session.Manage',
        controllerAs: 'vm',
        templateUrl: 'app/session/session.tpl.html'
      });
    }]);
}());
