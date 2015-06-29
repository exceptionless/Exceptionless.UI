(function () {
  'use strict';

  angular.module('app.organization')
    .controller('organization.Manage', ['$state', '$stateParams', '$window', 'billingService', 'dialogService', 'organizationService', 'projectService', 'userService', 'notificationService', 'featureService', 'dialogs', 'STRIPE_PUBLISHABLE_KEY', function ($state, $stateParams, $window, billingService, dialogService, organizationService, projectService, userService, notificationService, featureService, dialogs, STRIPE_PUBLISHABLE_KEY) {
      var _ignoreRefresh = false;
      var _organizationId = $stateParams.id;
      var vm = this;

      function activateTab(tabName) {
        vm.tabBillingActive = tabName === 'billing';
        vm.tabProjectsActive = tabName === 'projects';
        vm.tabUsersActive = tabName === 'users';
      }

      function addUser() {
        return dialogs.create('app/organization/manage/add-user-dialog.tpl.html', 'AddUserDialog as vm').result.then(createUser);
      }

      function canChangePlan() {
        return STRIPE_PUBLISHABLE_KEY && vm.organization;
      }

      function changePlan() {
        return billingService.changePlan(vm.organization.id);
      }

      function createUser(emailAddress) {
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

        return organizationService.addUser(_organizationId, emailAddress).catch(onFailure);
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

        return getOrganization();
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

      function hasAdminRole(user) {
        return userService.hasAdminRole(user);
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
        return dialogService.confirmDanger('Are you sure you want to delete this organization?', 'DELETE ORGANIZATION').then(function () {
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

      function save(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure() {
          notificationService.error('An error occurred while saving the organization.');
        }

        return organizationService.update(_organizationId, vm.organization).catch(onFailure);
      }

      vm.addUser = addUser;
      vm.canChangePlan = canChangePlan;
      vm.changePlan = changePlan;
      vm.get = get;
      vm.hasAdminRole = hasAdminRole;
      vm.hasPremiumFeatures = hasPremiumFeatures;
      vm.invoices = {
        get: function (options, useCache) {
          return  organizationService.getInvoices(_organizationId, options, useCache);
        },
        options: {
          limit: 12
        },
        organizationId: _organizationId
      };
      vm.leaveOrganization = leaveOrganization;
      vm.organization = {};
      vm.organizationForm = {};
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
      vm.save = save;
      vm.tabBillingActive = false;
      vm.tabProjectsActive = false;
      vm.tabUsersActive = false;
      vm.users = {
        get: function (options, useCache) {
          return userService.getByOrganizationId(_organizationId, options, useCache);
        },
        options: {
          limit: 10
        },
        organizationId: _organizationId
      };

      activateTab($stateParams.tab);
      get();
    }]);
}());
