(function () {
  'use strict';

  angular.module('exceptionless.billing')
    .controller('ChangePlanDialog', ['$modalInstance', 'organizationService', 'userService', function ($modalInstance, organizationService, userService, organizationId) {
      var vm = this;

      function cancel() {
        $modalInstance.dismiss('cancel');
      }

      function changePlan(isValid) {
        if (!isValid) {
          return;
        }

        $modalInstance.close(vm.currentPlan);
      }

      function getOrganizations() {
        function getSelectedOrganization() {
          function onSuccess(response) {
            vm.organizations.push(response.data.plain());
            return vm.organizations;
          }

          if (!organizationId || vm.organizations.filter(function(o) { return o.id === organizationId; })[0])
            return;

          return organizationService.getById(organizationId).then(onSuccess);
        }

        function getAllOrganizations() {
          function onSuccess(response) {
            angular.forEach(response.data.plain(), function(value, key) {
              vm.organizations.push(value);
            });

            return vm.organizations;
          }

          return  organizationService.getAll().then(onSuccess);
        }

        function onSuccess() {
          vm.currentOrganization = vm.organizations.filter(function(o) { return o.id === (vm.currentOrganization.id || organizationId); })[0];
          if (!vm.currentOrganization) {
            vm.currentOrganization = vm.organizations.length > 0 ? vm.organizations[0] : {};
          }
        }

        function onFailure() {
          notificationService.error('An error occurred while loading your organizations.');
        }

        vm.organizations = [];
        return getAllOrganizations().then(getSelectedOrganization).then(onSuccess, onFailure);
      }

      function getPlans() {
        function onSuccess(response) {
          vm.plans = response.data.plain();
          vm.currentPlan = vm.plans.filter(function(p) { return p.id === vm.currentOrganization.plan_id; })[0]

          return vm.plans;
        }

        function onFailure() {
          notificationService.error('An error occurred while loading available billing plans.');
        }

        return organizationService.getPlans(vm.currentOrganization.id).then(onSuccess, onFailure);
      }

      function getUser() {
        function onSuccess(response) {
          vm.user = response.data.plain();

          if (!vm.card.name) {
            vm.card.name = vm.user.full_name;
          }

          return vm.user;
        }

        return userService.getCurrentUser().then(onSuccess);
      }

      function hasAdminRole() {
        return vm.user && vm.user.roles && vm.user.roles['global'];
      }

      function isNewCard() {
        return vm.card && vm.card.mode === 'new';
      }

      function isPaidPlan() {
        return vm.currentPlan && vm.currentPlan.price !== 0;
      }

      vm.cancel = cancel;
      vm.card = { mode: 'new' };
      vm.currentOrganization = {};
      vm.currentPlan = {};
      vm.changePlan = changePlan;
      vm.getPlans = getPlans;
      vm.hasAdminRole = hasAdminRole;
      vm.isNewCard = isNewCard;
      vm.isPaidPlan = isPaidPlan;
      vm.organizations = [];
      vm.paymentMessage = null;
      vm.plans = [];

      getOrganizations().then(getPlans).then(getUser);
    }]);
}());
