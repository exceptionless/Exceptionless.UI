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

          function getFilteredDisplayName() {
            var time = filterService.getTime();
            if (time === 'last hour') {
              return 'Last Hour';
            }

            if (time === 'last 24 hours') {
              return 'Last 24 Hours';
            }

            if (time === 'last week') {
              return 'Last Week';
            }

            if (time === 'last 30 days') {
              return 'Last 30 Days';
            }

            if (time === 'all') {
              return 'All Time';
            }

            var range = dateRangeParserService.parse(time);
            if (range && range.start && range.end) {
              return moment(range.start).twix(moment(range.end)).format();
            }

            setFilter('last week');
            return 'Last Week';
          }

          function isActive(filteredDisplayName) {
            var time = filterService.getTime();
            if (time && filteredDisplayName === 'Custom') {
              var range = dateRangeParserService.parse(time);
              return range && range.start && range.end;
            }

            return filteredDisplayName === time;
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

          function updateFilterDisplayName() {
            vm.filteredDisplayName = getFilteredDisplayName();
          }

          var interval = $interval(updateFilterDisplayName, 60 * 1000);
          $scope.$on('$destroy', function () {
            $interval.cancel(interval);
          });

          vm.hasFilter = hasFilter;
          vm.isActive = isActive;
          vm.filteredDisplayName = getFilteredDisplayName();
          vm.isDropDownOpen = false;
          vm.setCustomFilter = setCustomFilter;
          vm.setFilter = setFilter;
          vm.updateFilterDisplayName = updateFilterDisplayName;
        }],
        controllerAs: 'vm'
      };
    }]);
}());
