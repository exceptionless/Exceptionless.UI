(function () {
  'use strict';

  angular.module('app.organization')
    .controller('AddOrganizationDialog', ['$ExceptionlessClient', '$modalInstance', '$timeout', function ($ExceptionlessClient, $modalInstance, $timeout) {
      var source = 'app.organization.AddOrganizationDialog';
      var _canSave = true;
      var vm = this;

      function cancel() {
        $ExceptionlessClient.submitFeatureUsage(source + '.cancel');
        $modalInstance.dismiss('cancel');
      }

      function save() {
        if (!vm.addOrganizationForm || vm.addOrganizationForm.$invalid) {
          _canSave = true;
          return;
        }

        if (!vm.data.name || vm.addOrganizationForm.$pending) {
          var timeout = $timeout(function() {
            $timeout.cancel(timeout);
            save();
          }, 100);
          return;
        }

        if (_canSave) {
          _canSave = false;
        } else {
          return;
        }

        $ExceptionlessClient.createFeatureUsage(source + '.save').setProperty('name', vm.data.name).submit();
        $modalInstance.close(vm.data.name);
      }

      vm.addOrganizationForm = {};
      vm.cancel = cancel;
      vm.data = {};
      vm.save = save;
      $ExceptionlessClient.submitFeatureUsage(source);
    }]);
}());
