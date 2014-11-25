(function () {
  'use strict';

  angular.module('exceptionless.projects', [
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
        controller: ['$window', '$state', 'dialogService', 'linkService', 'notificationService', 'paginationService', 'projectService', function ($window, $state, dialogService, linkService, notificationService, paginationService, projectService) {
          var vm = this;

          function get(options) {
            function onSuccess(response) {
              vm.projects = response.data.plain();

              var links = linkService.getLinksQueryParameters(response.headers('link'));
              vm.previous = links['previous'];
              vm.next = links['next'];

              vm.pageSummary = paginationService.getCurrentPageSummary(response.data, vm.currentOptions.page, vm.currentOptions.limit);

              if (vm.projects.length === 0 && vm.currentOptions.page && vm.currentOptions.page > 1) {
                return get();
              }

              return vm.projects;
            }

            vm.currentOptions = options || vm.settings.options;
            return vm.settings.get(vm.currentOptions).then(onSuccess);
          }

          function hasProjects() {
            return vm.projects && vm.projects.length > 0;
          }

          function open(id, event) {
            // TODO: implement this.
            if (event.ctrlKey || event.which === 2) {
              $window.open('/#/project/' + id + '/manage', '_blank');
            } else {
              $state.go('app.project.manage', { id: id });
            }
          }

          function nextPage() {
            return get(vm.next);
          }

          function previousPage() {
            return get(vm.previous);
          }

          function remove(project) {
            return dialogService.confirmDanger('Are you sure you want to remove the project?', 'REMOVE PROJECT').then(function () {
              function onSuccess() {
                vm.projects.splice(vm.projects.indexOf(project), 1);
              }

              function onFailure() {
                notificationService.error('An error occurred while trying to remove the project.');
              }

              return projectService.remove(project.id).then(onSuccess, onFailure);
            });
          }

          vm.get = get;
          vm.hasProjects = hasProjects;
          vm.nextPage = nextPage;
          vm.open = open;
          vm.previousPage = previousPage;
          vm.projects = [];
          vm.remove = remove;

          get();
        }],
        controllerAs: 'vm'
      };
    });
}());
