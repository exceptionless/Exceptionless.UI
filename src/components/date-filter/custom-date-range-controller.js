(function () {
  'use strict';

  angular.module('exceptionless.date-filter')
    .controller('CustomDateRangeDialog', ['$modalInstance', 'data', function ($modalInstance, data) {
      var vm = this;

      function cancel() {
        $modalInstance.dismiss('cancel');
      }

      function save() {
        if (!vm.range.start || !vm.range.end) {
          return;
        }

        if (!angular.isObject(vm.range.start)) {
          vm.range.start = moment(vm.range.start);
        }

        if (!angular.isObject(vm.range.end)) {
          vm.range.end = moment(vm.range.end);
        }

        if ((vm.range.start.diff(vm.range.end, 'seconds') === 0) || (vm.maxDate.diff(vm.range.end, 'seconds') === 0)) {
          vm.range.end = vm.range.end.endOf('day');
        }

        $modalInstance.close(vm.range);
      }

      vm.cancel = cancel;
      vm.maxDate = moment();
      vm.minDate = moment(new Date(2012, 1, 1));
      vm.range = {
        start: data.start,
        end: data.end
      };
      vm.save = save;
    }]);
}());
