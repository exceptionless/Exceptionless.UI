(function () {
  'use strict';

  angular.module('exceptionless.billing')
    .factory('billingService', ['$ExceptionlessClient', 'dialogs', 'dialogService', '$q', function ($ExceptionlessClient, dialogs, dialogService, $q) {
      var source = 'exceptionless.billing.billingService';

      function changePlan(organizationId) {
        return dialogs.create('components/billing/change-plan-dialog.tpl.html', 'ChangePlanDialog as vm', organizationId).result;
      }

      function confirmUpgradePlan(message, organizationId) {
        function onSuccess() {
          return changePlan(organizationId);
        }

        function onFailure() {
          $ExceptionlessClient.createFeatureUsage(source + '.confirmUpgradePlan.cancel')
            .setMessage(message)
            .setProperty('OrganizationId', organizationId)
            .submit();

          return $q.reject('cancelled');
        }

        $ExceptionlessClient.createFeatureUsage(source + '.confirmUpgradePlan')
          .setMessage(message)
          .setProperty('OrganizationId', organizationId)
          .submit();
        return dialogService.confirm(message, 'Upgrade Plan').then(onSuccess, onFailure);
      }

      var service = {
        changePlan: changePlan,
        confirmUpgradePlan: confirmUpgradePlan
      };

      return service;
    }
    ]);
}());
