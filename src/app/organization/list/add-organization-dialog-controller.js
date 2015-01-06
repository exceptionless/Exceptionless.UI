(function () {
  'use strict';

  angular.module('app.organization')
    .controller('AddOrganizationDialog', ['$modalInstance', '$timeout', function ($modalInstance, $timeout) {
      var _canSave = true;
      var vm = this;

      function cancel() {
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

        $modalInstance.close(vm.data.name);
      }

      vm.addOrganizationForm = {};
      vm.cancel = cancel;
      vm.data = {};
      vm.save = save;
    }]);
}());
