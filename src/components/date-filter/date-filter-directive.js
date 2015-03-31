(function () {
  'use strict';

  angular.module('exceptionless.date-filter')
    .directive('dateFilter', ['$interval', 'dateRangeParserService', function ($interval, dateRangeParserService) {
      return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: 'components/date-filter/date-filter-directive.tpl.html',
        controller: ['$interval', '$scope', 'dialogs', 'filterService', function ($interval, $scope, dialogs, filterService) {
          var vm = this;

          function getFilterName() {
            var time = filterService.getTime();
            if (time === 'last hour') {
              return moment().subtract(1, 'hours').twix(moment()).format();
            }

            if (time === 'last 24 hours') {
              return moment().subtract(24, 'hours').twix(moment()).format();
            }

            if (time === 'last week') {
              return moment().subtract(7, 'days').startOf('day').twix(moment()).format();
            }

            if (time === 'last 30 days') {
              return moment().subtract(30, 'days').startOf('day').twix(moment()).format();
            }

            if (time === 'all') {
              return 'All Time';
            }

            var range = dateRangeParserService.parse(time);
            if (range && range.start && range.end) {
              return moment(range.start).twix(moment(range.end)).format();
            }

            setFilter('last week');
            return moment().subtract(7, 'days').startOf('day').twix(moment()).format();
          }

          function isActive(filterName) {
            var time = filterService.getTime();
            if (time && filterName === 'Custom') {
              var range = dateRangeParserService.parse(time);
              return range && range.start && range.end;
            }

            return filterName === time;
          }

          function hasFilter() {
            return filterService.getTime() !== 'all';
          }

          function setCustomFilter() {
            function onSuccess(range) {
              setFilter(range.start.format('YYYY-MM-DDTHH:mm:ss') + '-' + range.end.format('YYYY-MM-DDTHH:mm:ss'));
              return range;
            }

            var start = moment().subtract(7, 'days').startOf('day');
            var end = moment();

            var time = filterService.getTime();
            if (time === 'last hour') {
              start = moment().subtract(1, 'hours');
            } else if (time === 'last 24 hours') {
              start = moment().subtract(24, 'hours');
            } else if (time === 'last week' || time === 'all') {
              start = moment().subtract(7, 'days').startOf('day');
            } else if (time === 'last 30 days') {
              start = moment().subtract(30, 'days').startOf('day');
            } else {
              var range = dateRangeParserService.parse(time);
              if (range && range.start && range.end) {
                start = moment(range.start);
                end = moment(range.end);
              }
            }

            return dialogs.create('components/date-filter/custom-date-range-dialog.tpl.html', 'CustomDateRangeDialog as vm', { start: start, end: end }).result.then(onSuccess);
          }

          function setFilter(filter) {
            filterService.setTime(filter);
          }

          function updateFilterName() {
            vm.filterName = getFilterName();
          }

          var interval = $interval(updateFilterName, 60 * 1000);
          $scope.$on('$destroy', function () {
            $interval.cancel(interval);
          });

          vm.hasFilter = hasFilter;
          vm.isActive = isActive;
          vm.filterName = getFilterName();
          vm.isDropDownOpen = false;
          vm.setCustomFilter = setCustomFilter;
          vm.setFilter = setFilter;
          vm.updateFilterName = updateFilterName;
        }],
        controllerAs: 'vm'
      };
    }]);
}());
