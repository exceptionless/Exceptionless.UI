(function () {
  'use strict';

  angular.module('app.organization')
    .directive('invoices', function () {
      return {
        bindToController: true,
        restrict: 'E',
        replace: true,
        scope: {
          settings: "="
        },
        templateUrl: 'app/organization/manage/invoices-directive.tpl.html',
        controller: ['$window', '$state', 'dialogService', 'linkService', 'notificationService', 'paginationService', 'userService', function ($window, $state, dialogService, linkService, notificationService, paginationService, userService) {
          var vm = this;

          function get(options, useCache) {
            function onSuccess(response) {
              vm.invoices = response.data.plain();

              var links = linkService.getLinksQueryParameters(response.headers('link'));
              vm.previous = links['previous'];
              vm.next = links['next'];

              vm.pageSummary = paginationService.getCurrentPageSummary(response.data, vm.currentOptions.page, vm.currentOptions.limit);

              if (vm.invoices.length === 0 && vm.currentOptions.page && vm.currentOptions.page > 1) {
                return get(null, useCache);
              }

              return vm.invoices;
            }

            vm.currentOptions = options || vm.settings.options;
            return vm.settings.get(vm.currentOptions, useCache).then(onSuccess);
          }

          function hasAdminRole(user) {
            return userService.hasAdminRole(user);
          }

          function hasInvoices() {
            return vm.invoices && vm.invoices.length > 0;
          }

          function open(id, event) {
            $window.open($state.href('payment', { id: id }, { absolute: true }), '_blank');
            event.preventDefault();
          }

          function nextPage() {
            return get(vm.next);
          }

          function previousPage() {
            return get(vm.previous);
          }

          vm.currentOptions = {};
          vm.get = get;
          vm.hasAdminRole = hasAdminRole;
          vm.hasInvoices = hasInvoices;
          vm.nextPage = nextPage;
          vm.open = open;
          vm.previousPage = previousPage;
          vm.invoices = [];

          get();
        }],
        controllerAs: 'vm'
      };
    });
}());
