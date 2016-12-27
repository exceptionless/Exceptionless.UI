(function () {
  'use strict';

  angular.module('exceptionless.events')
    .directive('events', function (linkService) {
      return {
        bindToController: true,
        restrict: 'E',
        replace: true,
        scope: {
          settings: '='
        },
        templateUrl: 'components/events/events-directive.tpl.html',
        controller: ['$ExceptionlessClient', '$window', '$state', '$stateParams', 'eventsActionsService', 'filterService', 'linkService', 'notificationService', 'paginationService', function ($ExceptionlessClient, $window, $state, $stateParams, eventsActionsService, filterService, linkService, notificationService, paginationService) {
          var vm = this;
          function canRefresh(data) {
            if (!!data && data.type === 'PersistentEvent') {
              // We are already listening to the stack changed event... This prevents a double refresh.
              if (!data.deleted) {
                return false;
              }

              // Refresh if the event id is set (non bulk) and the deleted event matches one of the events.
              if (!!data.id && !!vm.events) {
                return vm.events.filter(function (e) { return e.id === data.id; }).length > 0;
              }

              return filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
            }

            if (!!data && data.type === 'Stack') {
              return filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
            }

            return true;
          }

          function get(options) {
            function onSuccess(response) {
              vm.events = response.data.plain();
              vm.selectedIds = vm.selectedIds.filter(function(id) { return vm.events.filter(function(e) { return e.id === id; }).length > 0; });

              var links = linkService.getLinksQueryParameters(response.headers('link'));
              vm.previous = links['previous'];
              vm.next = links['next'];

              vm.pageSummary = paginationService.getCurrentPageSummary(response.data, vm.currentOptions.page, vm.currentOptions.limit);

              if (vm.events.length === 0 && vm.currentOptions.page && vm.currentOptions.page > 1) {
                return get();
              }

              return vm.events;
            }

            vm.loading = vm.events.length === 0;
            vm.currentOptions = options || vm.settings.options;
            return vm.settings.get(vm.currentOptions).then(onSuccess).catch(function(e) {}).finally(function() {
              vm.loading = false;
            });
          }

          function open(id, event) {
            var openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
            $ExceptionlessClient.createFeatureUsage(vm.source + '.open').setProperty('id', id).setProperty('_blank', openInNewTab).submit();
            if (openInNewTab) {
              $window.open($state.href('app.event', { id: id }, { absolute: true }), '_blank');
            } else {
              $state.go('app.event', { id: id });
            }

            event.preventDefault();
          }

          function nextPage() {
            $ExceptionlessClient.createFeatureUsage(vm.source + '.nextPage').setProperty('next', vm.next).submit();
            return get(vm.next);
          }

          function previousPage() {
            $ExceptionlessClient.createFeatureUsage(vm.source + '.previousPage').setProperty('previous', vm.previous).submit();
            return get(vm.previous);
          }

          function save(action) {
            function onSuccess() {
              vm.selectedIds = [];
            }

            if (vm.selectedIds.length === 0) {
              notificationService.info(null, 'Please select one or more events');
            } else {
              action.run(vm.selectedIds).then(onSuccess);
            }
          }

          function updateSelection() {
            if (vm.events && vm.events.length === 0)
              return;

            if (vm.selectedIds.length > 0)
              vm.selectedIds = [];
            else
              vm.selectedIds = vm.events.map(function (event) {
                return event.id;
              });
          }

          this.$onInit = function $onInit() {
            vm.source = vm.settings.source + '.events';
            vm.actions = vm.settings.hideActions ? [] : eventsActionsService.getActions();
            vm.canRefresh = canRefresh;
            vm.events = [];
            vm.get = get;
            vm.hasFilter = filterService.hasFilter;
            vm.hideSessionStartTime = vm.settings.hideSessionStartTime || false;
            vm.loading = true;
            vm.open = open;
            vm.nextPage = nextPage;
            vm.previousPage = previousPage;
            vm.timeHeaderText = vm.settings.timeHeaderText || 'Date';
            vm.relativeTo = function() { return vm.settings.relativeTo; };
            vm.save = save;
            vm.selectedIds = [];
            vm.showType = vm.settings.summary ? vm.settings.summary.showType : !filterService.getEventType();
            vm.updateSelection = updateSelection;
            get();
          };
        }],
        controllerAs: 'vm'
      };
    });
}());
