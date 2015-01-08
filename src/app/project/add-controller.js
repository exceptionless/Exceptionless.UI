(function () {
  'use strict';

  angular.module('app.project')
    .controller('project.Add', ['$state', '$stateParams', '$timeout', 'billingService', 'organizationService', 'projectService', 'notificationService', function ($state, $stateParams, $timeout, billingService, organizationService, projectService, notificationService) {
      var _canAdd = true;
      var _newOrganizationId = '__newOrganization';

      var vm = this;

      function add() {
        function resetCanAdd() {
          _canAdd = true;
        }

        if (!vm.addForm || vm.addForm.$invalid) {
          resetCanAdd();
          return;
        }

        if ((canCreateOrganization() && !vm.organization_name) || !vm.project_name || vm.addForm.$pending) {
          var timeout = $timeout(function() {
            $timeout.cancel(timeout);
            add();
          }, 100);
          return;
        }

        if (_canAdd) {
          _canAdd = false;
        } else {
          return;
        }

        if (canCreateOrganization()) {
          return createOrganization(vm.organization_name).then(createProject).then(resetCanAdd, resetCanAdd);
        }

        return createProject(vm.currentOrganization).then(resetCanAdd, resetCanAdd);
      }

      function canCreateOrganization() {
        return vm.currentOrganization.id === _newOrganizationId || !hasOrganizations();
      }

      function createOrganization(name) {
        function onSuccess(response) {
          vm.organizations.push(response.data);
          vm.currentOrganization = response.data;
          return response.data;
        }

        function onFailure(response) {
          if (response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message).then(function () {
              return createOrganization(name);
            });
          }

          var message = 'An error occurred while creating the organization.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return organizationService.create(name).then(onSuccess, onFailure);
      }

      function createProject(organization) {
        if (!organization) {
          _canAdd = true;
          return;
        }

        function onSuccess(response) {
          $state.go('app.project.configure', { id: response.data.id, redirect: true });
        }

        function onFailure(response) {
          if (response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message).then(function () {
              return createProject(organization);
            });
          }

          var message = 'An error occurred while creating the project.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return projectService.create(organization.id, vm.project_name).then(onSuccess, onFailure);
      }

      function getOrganizations() {
        function onSuccess(response) {
          vm.organizations = response.data;
          vm.organizations.push({id: _newOrganizationId, name: '<New Organization>'});

          var currentOrganizationId = vm.currentOrganization.id ? vm.currentOrganization.id : $stateParams.organizationId;
          vm.currentOrganization = vm.organizations.filter(function(o) { return o.id === currentOrganizationId; })[0];
          if (!vm.currentOrganization) {
            vm.currentOrganization = vm.organizations.length > 0 ? vm.organizations[0] : {};
          }
        }

        organizationService.getAll().then(onSuccess);
      }

      function hasOrganizations() {
        return vm.organizations.filter(function (o) {
            return o.id !== _newOrganizationId;
          }).length > 0;
      }

      vm.add = add;
      vm.addForm = {};
      vm.canCreateOrganization = canCreateOrganization;
      vm.currentOrganization = {};
      vm.getOrganizations = getOrganizations;
      vm.hasOrganizations = hasOrganizations;
      vm.organizations = [];

      getOrganizations();
    }]);
}());
