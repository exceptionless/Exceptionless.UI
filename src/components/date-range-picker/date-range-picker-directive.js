(function () {
  'use strict';

  angular.module('exceptionless.date-range-picker', [
    'exceptionless.autofocus'
  ])
  .directive('dateRangePicker', ['$compile', '$parse', function ($parse) {
    return {
      restrict: 'E',
      scope: {
        format: '=',
        maxDate: '=',
        minDate: '=',
        range: '=',
        showDropdowns: '=',
        timePicker: '=',
        timePicker12Hour: '='
      },
      templateUrl: 'components/date-range-picker/date-range-picker-directive.tpl.html',
      link: function (scope, element) {
        var vm = scope;
        var options = {
          endDate: vm.range.end,
          format: vm.format || 'YYYY-MM-DD',
          maxDate: vm.maxDate,
          minDate: vm.minDate,
          showDropdowns: !!vm.showDropdowns,
          startDate: vm.range.start,
          timePicker: !!vm.timePicker,
          timePicker12Hour: !!vm.timePicker12Hour,
          timePickerIncrement: vm.timePickerIncrement || 1
        };

        var watcher = scope.$watch(vm.range, function (r) {
          if (!r) {
            return;
          }

          element.data('daterangepicker').setStartDate(r.start);
          element.data('daterangepicker').setEndDate(r.end);
        });

        scope.$on('$destroy', function () {
          watcher();
        });

        element.daterangepicker(options, function(start, end) {
          scope.$apply(function () {
            vm.range = { start: start, end: end };
          });
        });

        element.data('daterangepicker').setStartDate(vm.range.start);
        element.data('daterangepicker').setEndDate(vm.range.end);
      }
    };
  }]);
}());
