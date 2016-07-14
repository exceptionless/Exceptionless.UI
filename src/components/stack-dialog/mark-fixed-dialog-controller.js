(function () {
  'use strict';

  angular.module('exceptionless.stack-dialog')
    .controller('MarkFixedDialog', ['$ExceptionlessClient', '$uibModalInstance', function ($ExceptionlessClient, $uibModalInstance) {
      var source = 'app.stack-dialog.MarkFixedDialog';
      var vm = this;

      function cancel() {
        $uibModalInstance.dismiss('cancel');
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        $ExceptionlessClient.createFeatureUsage(source + '.save').setProperty('version', vm.data.version).submit();
        $uibModalInstance.close(vm.data.version);
      }

      vm.cancel = cancel;
      vm.save = save;
      $ExceptionlessClient.submitFeatureUsage(source);
    }]);
}());

