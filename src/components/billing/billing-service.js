(function () {
  'use strict';

  angular.module('exceptionless.billing')
    .factory('billingService', ['dialogs', function (dialogs) {
      function changePlan(organizationId) {
        return dialogs.create('components/billing/change-plan-dialog.tpl.html', 'ChangePlanDialog as vm', organizationId).result;
      }

      var service = {
        changePlan: changePlan
      };

      return service;
    }
    ]);
}());
