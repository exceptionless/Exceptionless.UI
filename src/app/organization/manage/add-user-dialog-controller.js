(function () {
  'use strict';

  angular.module('app.organization')
    .controller('AddUserDialog', ['$ExceptionlessClient', '$modalInstance', function ($ExceptionlessClient, $modalInstance) {
      var source = 'app.organization.AddUserDialog';
      var vm = this;

      function cancel() {
        $ExceptionlessClient.submitFeatureUsage(source + '.cancel');
        $modalInstance.dismiss('cancel');
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        $ExceptionlessClient.createFeatureUsage(source + '.save').setProperty('email', vm.data.email).submit();
        $modalInstance.close(vm.data.email);
      }

      vm.cancel = cancel;
      vm.save = save;
      $ExceptionlessClient.submitFeatureUsage(source);
    }]);
}());
