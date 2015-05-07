(function () {
  'use strict';

  angular.module('app.project')
    .controller('AddConfigurationDialog', ['$ExceptionlessClient', '$modalInstance', function ($ExceptionlessClient, $modalInstance, configuration) {
      var source = 'app.project.AddConfigurationDialog';
      var vm = this;

      function cancel() {
        $ExceptionlessClient.submitFeatureUsage(source + '.cancel');
        $modalInstance.dismiss('cancel');
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        $ExceptionlessClient.createFeatureUsage(source + '.save').setProperty('configuration', vm.data).submit();
        $modalInstance.close(vm.data);
      }

      vm.cancel = cancel;
      vm.configuration = configuration;
      vm.data = {};
      vm.save = save;
      $ExceptionlessClient.submitFeatureUsage(source);
    }]);
}());
