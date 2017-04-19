(function () {
  'use strict';

  angular.module('app.organization')
    .controller('organization.Upgrade', function ($ExceptionlessClient, $state, $stateParams, billingService, organizationService, notificationService, STRIPE_PUBLISHABLE_KEY) {
      var vm = this;

      function get() {
        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The organization "' + vm._organizationId + '" could not be found.');
        }

        return organizationService.getById(vm._organizationId, false).catch(onFailure);
      }

      function changePlan() {
        function redirect() {
          return $state.go('app.organization.manage', { id: vm._organizationId });
        }

        return billingService.changePlan(vm._organizationId.id).then(redirect, redirect);
      }

      this.$onInit = function $onInit() {
        vm._organizationId = $stateParams.id;
        $ExceptionlessClient.createFeatureUsage('organization.Upgrade').setProperty('OrganizationId', vm._organizationId).submit();

        if (!STRIPE_PUBLISHABLE_KEY) {
          $state.go('app.organization.manage', { id: vm._organizationId });
          return notificationService.error('Billing is currently disabled!');
        }

        $ExceptionlessClient.submitFeatureUsage('organization.Upgrade');
        return get().then(changePlan);
      };
    });
}());
