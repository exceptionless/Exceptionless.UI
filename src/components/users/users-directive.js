(function () {
  'use strict';

  angular.module('exceptionless.users', [
    'exceptionless.dialog',
    'exceptionless.link',
    'exceptionless.notification',
    'exceptionless.organization',
    'exceptionless.pagination',
    'exceptionless.refresh',
    'exceptionless.user'
  ])
    .directive('users', function () {
      return {
        bindToController: true,
        restrict: 'E',
        replace: true,
        scope: {
          settings: "="
        },
        templateUrl: 'components/users/users-directive.tpl.html',
        controller: ['$window', '$state', 'dialogService', 'linkService', 'notificationService', 'organizationService', 'paginationService', 'userService', function ($window, $state, dialogService, linkService, notificationService, organizationService, paginationService, userService) {
          var vm = this;

          function get(options, useCache) {
            function onSuccess(response) {
              vm.users = response.data.plain();

              var links = linkService.getLinksQueryParameters(response.headers('link'));
              vm.previous = links['previous'];
              vm.next = links['next'];

              vm.pageSummary = paginationService.getCurrentPageSummary(response.data, vm.currentOptions.page, vm.currentOptions.limit);

              if (vm.users.length === 0 && vm.currentOptions.page && vm.currentOptions.page > 1) {
                return get(null, useCache);
              }

              return vm.users;
            }

            vm.currentOptions = options || vm.settings.options;
            return vm.settings.get(vm.currentOptions, useCache).then(onSuccess);
          }

          function hasAdminRole(user) {
            return userService.hasAdminRole(user);
          }

          function hasUsers() {
            return vm.users && vm.users.length > 0;
          }

          function nextPage() {
            return get(vm.next);
          }

          function previousPage() {
            return get(vm.previous);
          }

          function remove(user) {
            return dialogService.confirmDanger('Are you sure you want to remove this user from your organization?', 'REMOVE USER').then(function () {
              function onFailure() {
                notificationService.error('An error occurred while trying to remove the user.');
              }

              return organizationService.removeUser(vm.settings.organizationId, user.email_address).catch(onFailure);
            });
          }

          function resendNotification(user) {
            function onFailure() {
              notificationService.error('An error occurred while trying to resend the notification.');
            }

            return organizationService.addUser(vm.settings.organizationId, user.email_address).catch(onFailure);
          }

          function updateAdminRole(user) {
            var message = 'Are you sure you want to ' + (!userService.hasAdminRole(user) ? 'add' : 'remove') + ' the admin role for this user?';
            return dialogService.confirmDanger(message, (!userService.hasAdminRole(user) ? 'ADD' : 'REMOVE')).then(function () {
              function onFailure() {
                notificationService.error('An error occurred while ' + (!userService.hasAdminRole(user) ? 'add' : 'remove') + ' the admin role.');
              }

              if (!userService.hasAdminRole(user)) {
                return userService.addAdminRole(user.id).catch(onFailure);
              }

              return userService.removeAdminRole(user.id).catch(onFailure);
            });
          }

          vm.currentOptions = {};
          vm.get = get;
          vm.hasAdminRole = hasAdminRole;
          vm.hasUsers = hasUsers;
          vm.nextPage = nextPage;
          vm.open = open;
          vm.previousPage = previousPage;
          vm.remove = remove;
          vm.resendNotification = resendNotification;
          vm.updateAdminRole = updateAdminRole;
          vm.users = [];

          get();
        }],
        controllerAs: 'vm'
      };
    });
}());
