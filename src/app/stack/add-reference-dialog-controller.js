(function () {
  'use strict';

  angular.module('app.stack')
    .controller('AddReferenceDialog', ['$ExceptionlessClient', '$modalInstance', function ($ExceptionlessClient, $modalInstance) {
      var source = 'app.stack.AddReferenceDialog';
      var vm = this;

      function cancel() {
        $ExceptionlessClient.submitFeatureUsage(source + '.cancel');
        $modalInstance.dismiss('cancel');
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        $ExceptionlessClient.createFeatureUsage(source + '.save').setProperty('url', vm.data.url).submit();
        $modalInstance.close(vm.data.url);
      }

      vm.cancel = cancel;
      vm.save = save;
      $ExceptionlessClient.submitFeatureUsage(source);
    }]);
}());
