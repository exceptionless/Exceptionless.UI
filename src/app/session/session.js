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
      'exceptionless.organization',
      'exceptionless.organization-notifications',
      'exceptionless.project',
      'exceptionless.stat',
      'exceptionless.summary',
      'exceptionless.timeago',
      'exceptionless.users'
    ])
    .config(function ($stateProvider) {
      var onEnterSetTypeFilter = ['filterService', function (filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
        filterService.setEventType('session', true);
      }];

      var onExitRemoveTypeFilter = ['filterService', function (filterService) {
        filterService.setEventType(null, true);
      }];

      var title = 'Session Dashboard';
      $stateProvider.state('app.session', {
        abstract: true,
        url: '/session',
        template: '<ui-view autoscroll="true" />'
      });

      $stateProvider.state('app.session.dashboard', {
        title: title,
        url: '/dashboard',
        controller: 'session.Dashboard',
        controllerAs: 'vm',
        templateUrl: 'app/session/dashboard.tpl.html',
        onEnter: onEnterSetTypeFilter,
        onExit: onExitRemoveTypeFilter
      });

      $stateProvider.state('app.session-dashboard', {
        title: title,
        url: '/session/dashboard',
        controller: 'session.Dashboard',
        controllerAs: 'vm',
        templateUrl: 'app/session/dashboard.tpl.html',
        onEnter: onEnterSetTypeFilter,
        onExit: onExitRemoveTypeFilter
      });

      $stateProvider.state('app.session-project-dashboard', {
        title: title,
        url: '/project/{projectId:[0-9a-fA-F]{24}}/session/dashboard',
        controller: 'session.Dashboard',
        controllerAs: 'vm',
        templateUrl: 'app/session/dashboard.tpl.html',
        onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
          filterService.setProjectId($stateParams.projectId, true);
          filterService.setEventType('session', true);
        }],
        onExit: onExitRemoveTypeFilter,
        resolve: {
          project: ['$stateParams', 'projectService', function($stateParams, projectService) {
            return projectService.getById($stateParams.projectId, true);
          }]
        }
      });

      $stateProvider.state('app.session-organization-dashboard', {
        title: title,
        url: '/organization/{organizationId:[0-9a-fA-F]{24}}/session/dashboard',
        controller: 'session.Dashboard',
        controllerAs: 'vm',
        templateUrl: 'app/session/dashboard.tpl.html',
        onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
          filterService.setOrganizationId($stateParams.organizationId, true);
          filterService.setEventType('session', true);
        }],
        onExit: onExitRemoveTypeFilter,
        resolve: {
          project: ['$stateParams', 'organizationService', function($stateParams, organizationService) {
            return organizationService.getById($stateParams.organizationId, true);
          }]
        }
      });
    });
}());
