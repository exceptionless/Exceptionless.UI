(function () {
  'use strict';

  angular.module('exceptionless.projects', [
    'exceptionless',
    'exceptionless.dialog',
    'exceptionless.link',
    'exceptionless.notification',
    'exceptionless.pagination',
    'exceptionless.project',
    'exceptionless.refresh'
  ])
    .directive('projects', function () {
      return {
        bindToController: true,
        restrict: 'E',
        replace: true,
        scope: {
          settings: "="
        },
        templateUrl: 'components/projects/projects-directive.tpl.html',
        controller: ['$ExceptionlessClient', '$window', '$state', 'dialogService', 'linkService', 'notificationService', 'paginationService', 'projectService', function ($ExceptionlessClient, $window, $state, dialogService, linkService, notificationService, paginationService, projectService) {
          var source = 'exceptionless.projects';
          var vm = this;

          function get(options, useCache) {
            function onSuccess(response) {
              vm.projects = response.data.plain();

              var links = linkService.getLinksQueryParameters(response.headers('link'));
              vm.previous = links['previous'];
              vm.next = links['next'];

              vm.pageSummary = paginationService.getCurrentPageSummary(response.data, vm.currentOptions.page, vm.currentOptions.limit);

              if (vm.projects.length === 0 && vm.currentOptions.page && vm.currentOptions.page > 1) {
                return get(null, useCache);
              }

              return vm.projects;
            }

            vm.currentOptions = options || vm.settings.options;
            return vm.settings.get(vm.currentOptions, useCache).then(onSuccess);
          }

          function hasProjects() {
            return vm.projects && vm.projects.length > 0;
          }

          function open(id, event) {
            $ExceptionlessClient.createFeatureUsage(source + '.open').setProperty('id', id).setProperty('_blank', event.ctrlKey || event.which === 2).submit();
            if (event.ctrlKey || event.which === 2) {
              $window.open($state.href('app.project.manage', { id: id }, { absolute: true }), '_blank');
            } else {
              $state.go('app.project.manage', { id: id });
            }

            event.preventDefault();
          }

          function nextPage() {
            $ExceptionlessClient.createFeatureUsage(source + '.nextPage').setProperty('next', vm.next).submit();
            return get(vm.next);
          }

          function previousPage() {
            $ExceptionlessClient.createFeatureUsage(source + '.previousPage').setProperty('previous', vm.previous).submit();
            return get(vm.previous);
          }

          function remove(project) {
            $ExceptionlessClient.createFeatureUsage(source + '.remove').setProperty('project', project).submit();
            return dialogService.confirmDanger('Are you sure you want to delete this project?', 'DELETE PROJECT').then(function () {
              function onSuccess() {
                $ExceptionlessClient.createFeatureUsage(source + '.remove.success').setProperty('project', project).submit();
                vm.projects.splice(vm.projects.indexOf(project), 1);
              }

              function onFailure() {
                $ExceptionlessClient.createFeatureUsage(source + '.remove.error').setProperty('project', project).submit();
                notificationService.error('An error occurred while trying to remove the project.');
              }

              return projectService.remove(project.id).then(onSuccess, onFailure);
            });
          }

          vm.currentOptions = {};
          vm.get = get;
          vm.hasProjects = hasProjects;
          vm.includeOrganizationName = !vm.settings.hideOrganizationName;
          vm.nextPage = nextPage;
          vm.open = open;
          vm.previousPage = previousPage;
          vm.projects = [];
          vm.remove = remove;

          $ExceptionlessClient.submitFeatureUsage(source);
          get();
        }],
        controllerAs: 'vm'
      };
    });
}());
