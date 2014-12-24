(function () {
  'use strict';

  angular.module('app.organization')
    .controller('organization.Manage', ['$state', '$stateParams', '$window', 'billingService', 'dialogService', 'organizationService', 'projectService', 'userService', 'notificationService', 'featureService', 'dialogs', function ($state, $stateParams, $window, billingService, dialogService, organizationService, projectService, userService, notificationService, featureService, dialogs) {
      var organizationId = $stateParams.id;
      var options = {limit: 5};
      var vm = this;

      function addUser() {
        dialogs.create('app/organization/manage/add-user-dialog.tpl.html', 'AddUserDialog as vm').result.then(function (name) {
          function onSuccess(response) {
            vm.users.push(response.data);
          }

          function onFailure(response) {
            if (response.status === 426) {
              return billingService.confirmUpgradePlan(response.data.message).then(function () {
                return addUser(name);
              });
            }

            notificationService.error('An error occurred while inviting the user.');
          }

          organizationService.addUser(name).then(onSuccess, onFailure);
        });
      }

      function getOrganization() {
        function onSuccess(response) {
          vm.organization = response.data.plain();
        }

        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The organization "' + organizationId + '" could not be found.');
        }

        return organizationService.getById(organizationId).then(onSuccess, onFailure);
      }

      function getInvoices() {
        function onSuccess(response) {
          vm.invoices = response.data.plain();
        }

        function onFailure() {
          notificationService.error('The invoices for this organization could not be loaded.');
        }

        return organizationService.getInvoices(organizationId, options).then(onSuccess, onFailure);
      }

      function getUsers() {
        function onSuccess(response) {
          vm.users = response.data.plain();
        }

        function onFailure() {
          notificationService.error('The users for this organization could not be loaded.');
        }

        return userService.getByOrganizationId(organizationId, options).then(onSuccess, onFailure);
      }

      function hasAdminRole(user) {
        return userService.hasAdminRole(user);
      }

      function hasInvoices() {
        return vm.invoices.length > 0;
      }

      function hasPremiumFeatures() {
        return featureService.hasPremium();
      }

      function removeUser(user) {
        return dialogService.confirmDanger('Are you sure you want to remove this user from your organization?', 'REMOVE USER').then(function () {
          function onSuccess() {
            vm.users.splice(vm.users.indexOf(user), 1);
          }

          function onFailure() {
            notificationService.error('An error occurred while trying to remove the user.');
          }

          return organizationService.removeUser(organizationId, user.id).then(onSuccess, onFailure);
        });
      }

      function resendNotification(user) {
        function onFailure() {
          notificationService.error('An error occurred while trying to resend the notification.');
        }

        return organizationService.addUser(organizationId, user.email_address).catch(onFailure);
      }

      function open(id, event) {
        if (event.ctrlKey || event.which === 2) {
          $window.open('/#/payment/' + id, '_blank');
        } else {
          $state.go('payment', {id: id});
        }

        event.preventDefault();
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure() {
          notificationService.error('An error occurred while saving the organization.');
        }

        return organizationService.update(organizationId, vm.organization).catch(onFailure);
      }

      function updateAdminRole(user) {
        var message = 'Are you sure you want to ' + (!userService.hasAdminRole(user) ? 'add' : 'remove') + ' the admin role for this user?';
        return dialogService.confirmDanger(message, (!userService.hasAdminRole(user) ? 'ADD' : 'REMOVE')).then(function () {
          function onFailure() {
            notificationService.error('An error occurred while ' + (!userService.hasAdminRole(user) ? 'add' : 'remove') + ' the admin role.');
          }

          if (!userService.hasAdminRole(user)) {
            return userService.addAdminRole(user.id).then(getUsers, onFailure);
          }

          return userService.removeAdminRole(user.id).then(getUsers, onFailure);
        });
      }

      vm.addUser = addUser;
      vm.hasAdminRole = hasAdminRole;
      vm.hasInvoices = hasInvoices;
      vm.hasPremiumFeatures = hasPremiumFeatures;
      vm.invoices = [];
      vm.open = open;
      vm.organization = {};
      vm.projects = {
        get: function (options) {
          return projectService.getByOrganizationId(organizationId, options);
        },
        options: {
          limit: 10,
          mode: 'summary'
        }
      };
      vm.removeUser = removeUser;
      vm.resendNotification = resendNotification;
      vm.save = save;
      vm.updateAdminRole = updateAdminRole;
      vm.users = [];

      getOrganization().then(getUsers).then(getInvoices);
    }]);
}());
