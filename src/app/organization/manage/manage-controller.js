(function () {
  'use strict';

  angular.module('app.organization')
    .controller('organization.Manage', ['$state', '$stateParams', '$window', 'billingService', 'dialogService', 'organizationService', 'projectService', 'userService', 'notificationService', 'featureService', 'dialogs', function ($state, $stateParams, $window, billingService, dialogService, organizationService, projectService, userService, notificationService, featureService, dialogs) {
      var _ignoreRefresh = false;
      var _organizationId = $stateParams.id;
      var _options = {limit: 5};

      var vm = this;

      function addUser() {
        return dialogs.create('app/organization/manage/add-user-dialog.tpl.html', 'AddUserDialog as vm').result.then(createUser);
      }

      function createUser(emailAddress) {
        function onSuccess(response) {
          if (!vm.users.filter(function (u) { return u.email_address === emailAddress; })[0]) {
            vm.users.push(response.data);
          }

          return response.data;
        }

        function onFailure(response) {
          if (response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message).then(function() {
              return createUser(emailAddress);
            });
          }

          var message = 'An error occurred while inviting the user.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return organizationService.addUser(_organizationId, emailAddress).then(onSuccess, onFailure);
      }

      function get(data) {
        if (_ignoreRefresh) {
          return;
        }

        if (data && data.type === 'Organization' && data.deleted && data.id === _organizationId) {
          $state.go('app.dashboard');
          notificationService.error('The organization "' + _organizationId + '" was deleted.');
          return;
        }

        return getOrganization().then(getUsers).then(getInvoices);
      }

      function getOrganization() {
        function onSuccess(response) {
          vm.organization = response.data.plain();
        }

        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The organization "' + _organizationId + '" could not be found.');
        }

        return organizationService.getById(_organizationId, false).then(onSuccess, onFailure);
      }

      function getInvoices() {
        function onSuccess(response) {
          vm.invoices = response.data.plain();
        }

        return organizationService.getInvoices(_organizationId, _options).then(onSuccess);
      }

      function getUsers() {
        function onSuccess(response) {
          vm.users = response.data.plain();
        }

        function onFailure() {
          notificationService.error('The users for this organization could not be loaded.');
        }

        return userService.getByOrganizationId(_organizationId, _options).then(onSuccess, onFailure);
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

      function leaveOrganization(currentUser){
        return dialogService.confirmDanger('Are you sure you want to leave this organization?', 'LEAVE ORGANIZATION').then(function () {
          function onSuccess() {
            $state.go('app.organization.list');
          }

          function onFailure(response) {
            var message = 'An error occurred while trying to leave the organization.';
            if (response.status === 400) {
              message += ' Message: ' + response.data.message;
            }

            notificationService.error(message);
            _ignoreRefresh = false;
          }

          _ignoreRefresh = true;
          return organizationService.removeUser(_organizationId, currentUser.email_address).then(onSuccess, onFailure);
        });
      }

      function removeOrganization() {
        return dialogService.confirmDanger('Are you sure you want to delete the organization?', 'DELETE ORGANIZATION').then(function () {
          function onSuccess() {
            $state.go('app.organization.list');
          }

          function onFailure(response) {
            var message = 'An error occurred while trying to delete the organization.';
            if (response.status === 400) {
              message += ' Message: ' + response.data.message;
            }

            notificationService.error(message);
            _ignoreRefresh = false;
          }

          _ignoreRefresh = true;
          return organizationService.remove(_organizationId).then(onSuccess, onFailure);
        });
      }

      function removeUser(user) {
        return dialogService.confirmDanger('Are you sure you want to remove this user from your organization?', 'REMOVE USER').then(function () {
          function onSuccess() {
            vm.users.splice(vm.users.indexOf(user), 1);
          }

          function onFailure() {
            notificationService.error('An error occurred while trying to remove the user.');
          }

          return organizationService.removeUser(_organizationId, user.email_address).then(onSuccess, onFailure);
        });
      }

      function resendNotification(user) {
        function onFailure() {
          notificationService.error('An error occurred while trying to resend the notification.');
        }

        return organizationService.addUser(_organizationId, user.email_address).catch(onFailure);
      }

      function openInvoice(id, event) {
        $window.open('/#/payment/' + id, '_blank');
        event.preventDefault();
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure() {
          notificationService.error('An error occurred while saving the organization.');
        }

        return organizationService.update(_organizationId, vm.organization).catch(onFailure);
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
      vm.get = get;
      vm.hasAdminRole = hasAdminRole;
      vm.hasInvoices = hasInvoices;
      vm.hasPremiumFeatures = hasPremiumFeatures;
      vm.invoices = [];
      vm.leaveOrganization = leaveOrganization;
      vm.openInvoice = openInvoice;
      vm.organization = {};
      vm.projects = {
        get: function (options, useCache) {
          return projectService.getByOrganizationId(_organizationId, options, useCache);
        },
        hideOrganizationName: true,
        options: {
          limit: 10,
          mode: 'summary'
        }
      };
      vm.removeOrganization = removeOrganization;
      vm.removeUser = removeUser;
      vm.resendNotification = resendNotification;
      vm.save = save;
      vm.updateAdminRole = updateAdminRole;
      vm.users = [];

      get();
    }]);
}());
