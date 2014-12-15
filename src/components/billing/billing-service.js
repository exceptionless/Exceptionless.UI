(function () {
  'use strict';

  angular.module('exceptionless.billing')
    .factory('billingService', ['dialogs', 'dialogService', function (dialogs, dialogService) {
      function changePlan(organizationId) {
        return dialogs.create('components/billing/change-plan-dialog.tpl.html', 'ChangePlanDialog as vm', organizationId).result;
      }

      function confirmUpgradePlan(message, organizationId) {
        function onSuccess() {
          return changePlan(organizationId);
        }

        return dialogService.confirm(message, 'Upgrade Plan').then(onSuccess);
      }

      var service = {
        changePlan: changePlan,
        confirmUpgradePlan: confirmUpgradePlan
      };

      return service;
    }
    ]);
}());
