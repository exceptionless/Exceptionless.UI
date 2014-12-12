(function () {
  'use strict';

  angular.module('app.payment')
    .controller('Payment', ['$state', '$stateParams', 'notificationService', 'organizationService', function ($state, $stateParams, notificationService, organizationService) {
      var invoiceId = $stateParams.id;
      var vm = this;

      function getInvoice() {
        function onSuccess(response) {
          vm.invoice = response.data.plain();
          return vm.invoice;
        }

        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The invoice "' + invoiceId + '" could not be found.');
        }

        return organizationService.getInvoice(invoiceId).then(onSuccess, onFailure);
      }

      function isPaid() {
        return vm.invoice && vm.invoice.paid;
      }

      vm.isPaid = isPaid;
      vm.invoice = {};

      getInvoice();
    }]);
}());
