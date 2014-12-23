(function () {
  'use strict';

  angular.module('exceptionless.billing')
    .controller('ChangePlanDialog', ['$modalInstance', 'adminService', 'Common', 'notificationService', 'organizationService', 'stripe', 'STRIPE_PUBLISHABLE_KEY', 'userService', 'data', function ($modalInstance, adminService, Common, notificationService, organizationService, stripe, STRIPE_PUBLISHABLE_KEY, userService, organizationId) {
      var vm = this;

      function cancel() {
        $modalInstance.dismiss('cancel');
      }

      function createStripeToken() {
        var expiration = Common.parseExpiry(vm.card.expiry);
        var payload = {
          number: vm.card.number,
          cvc: vm.card.cvc,
          exp_month: expiration.month,
          exp_year: expiration.year,
          name: vm.card.name
        };

        return stripe.card.createToken(payload);
      }

      function save(isValid) {
        function onCreateTokenSuccess(response) {
          return changePlan(false, { stripeToken: response.id, last4: response.card.last4, couponId: vm.coupon }).then(onSuccess, onFailure);
        }

        function onSuccess(response) {
          if(!response.data.success) {
            vm.paymentMessage = 'An error occurred while changing plans. Message: ' + response.data.message;
            return;
          }

          $modalInstance.close(vm.currentPlan);
          notificationService.success('Thanks! Your billing plan has been successfully changed.');
        }

        function onFailure(response) {
          if (response.error.message) {
            vm.paymentMessage = response.error.message;
          } else {
            vm.paymentMessage = 'An error occurred while changing plans.';
          }
        }

        if (!isValid) {
          return;
        }

        vm.paymentMessage = null;
        if (vm.currentOrganization.plan_id === 'EX_FREE' && vm.currentPlan.id === 'EX_FREE') {
          cancel();
          return;
        }

        if (hasAdminRole() || vm.currentPlan.id === 'EX_FREE') {
          return changePlan(hasAdminRole()).then(onSuccess, onFailure);
        }

        if (isNewCard()) {
          try {
            return createStripeToken().then(onCreateTokenSuccess, onFailure);
          } catch (error) {
            vm.paymentMessage = 'An error occurred while changing plans.';
            return null;
          }
        }

        return changePlan(false, { couponId: vm.coupon }).then(onSuccess, onFailure);
      }

      function changeOrganization() {
        vm.card.mode = hasExistingCard() ? 'existing' : 'new';
        return getPlans();
      }

      function changePlan(isAdmin, options) {
        if (isAdmin) {
          return adminService.changePlan(vm.currentOrganization.id, { planId: vm.currentPlan.id });
        } else {
          return organizationService.changePlan(vm.currentOrganization.id, angular.extend({}, { planId: vm.currentPlan.id }, options));
        }
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

          vm.card.mode = hasExistingCard() ? 'existing' : 'new';
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

          // Upsell to the next plan.
          var currentPlan = vm.plans.filter(function(p) { return p.id === vm.currentOrganization.plan_id; })[0] || vm.plans[0];
          var currentPlanIndex = vm.plans.indexOf(currentPlan);
          vm.currentPlan = vm.plans.length > currentPlanIndex + 1 ? vm.plans[currentPlanIndex + 1] : currentPlan;

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
        return userService.hasAdminRole(vm.user);
      }

      function hasExistingCard() {
        return !!vm.currentOrganization.card_last4;
      }

      function isBillingEnabled() {
        return !!STRIPE_PUBLISHABLE_KEY;
      }

      function isNewCard() {
        return vm.card && vm.card.mode === 'new';
      }
      function isPaidPlan() {
        return vm.currentPlan && vm.currentPlan.price !== 0;
      }

      vm.cancel = cancel;
      vm.card = { };
      vm.changeOrganization = changeOrganization;
      vm.coupon = null;
      vm.currentOrganization = {};
      vm.currentPlan = {};
      vm.getPlans = getPlans;
      vm.hasAdminRole = hasAdminRole;
      vm.hasExistingCard = hasExistingCard;
      vm.isBillingEnabled = isBillingEnabled;
      vm.isNewCard = isNewCard;
      vm.isPaidPlan = isPaidPlan;
      vm.organizations = [];
      vm.paymentMessage = !isBillingEnabled() ? 'Billing is currently disabled.' : null;
      vm.plans = [];
      vm.save = save;
      vm.stripe = {};

      getOrganizations().then(getPlans).then(getUser);
    }]);
}());
