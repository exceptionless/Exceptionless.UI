(function () {
  'use strict';

  angular.module('app.organization')
    .controller('AddUserDialog', ['$ExceptionlessClient', '$uibModalInstance', function ($ExceptionlessClient, $uibModalInstance) {
      var source = 'app.organization.AddUserDialog';
      var vm = this;

      function cancel() {
        $ExceptionlessClient.submitFeatureUsage(source + '.cancel');
        $uibModalInstance.dismiss('cancel');
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        $ExceptionlessClient.createFeatureUsage(source + '.save').setProperty('email', vm.data.email).submit();
        $uibModalInstance.close(vm.data.email);
      }

      vm.cancel = cancel;
      vm.save = save;
      $ExceptionlessClient.submitFeatureUsage(source);
    }]);
}());
