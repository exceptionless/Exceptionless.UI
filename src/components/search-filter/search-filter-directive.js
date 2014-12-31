(function () {
  'use strict';

  angular.module('exceptionless.search-filter', [
    'ngMessages',

    'exceptionless.refresh',
    'exceptionless.validators'
  ])
  .directive('searchFilter', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/search-filter/search-filter-directive.tpl.html',
      controller: ['filterService', function (filterService) {
        var vm = this;

        function clearFilter() {
          filterService.clearFilterAndIncludeFixedAndIncludeHidden();
          vm.isDropDownOpen = !vm.isDropDownOpen;
        }

        function hasFilter() {
          return filterService.getFilter() || filterService.getIncludeFixed() || filterService.getIncludeHidden();
        }

        function setFilter(filter) {
          filterService.setFilter(filter);
        }

        function setIncludeFixed(includeFixed) {
          filterService.setIncludeFixed(includeFixed);
        }

        function setIncludeHidden(includeHidden) {
          filterService.setIncludeHidden(includeHidden);
        }

        function updateFilter() {
          vm.filter = filterService.getFilter();
          vm.includeFixed =  filterService.getIncludeFixed();
          vm.includeHidden = filterService.getIncludeHidden();
        }

        vm.clearFilter = clearFilter;
        vm.filter = filterService.getFilter();
        vm.hasFilter = hasFilter;
        vm.isDropDownOpen = false;
        vm.includeFixed =  filterService.getIncludeFixed();
        vm.includeHidden = filterService.getIncludeHidden();
        vm.setFilter = setFilter;
        vm.setIncludeFixed = setIncludeFixed;
        vm.setIncludeHidden = setIncludeHidden;
        vm.updateFilter = updateFilter;
      }],
      controllerAs: 'vm'
    };
  });
}());
