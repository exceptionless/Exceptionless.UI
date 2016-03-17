(function () {
  'use strict';

  angular.module('exceptionless.search-filter')
    .directive('searchFilter', function () {
      return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: 'components/search-filter/search-filter-directive.tpl.html',
        controller: ['filterService', function (filterService) {
          var vm = this;

          function setSearchFilter(filter) {
            filterService.setFilter(filter);
          }

          function updateFilter() {
            vm.filter = filterService.getFilter();
          }
          
          vm.searchFilterForm = {};
          vm.setSearchFilter = setSearchFilter;
          vm.updateFilter = updateFilter;

          updateFilter();
        }],
        controllerAs: 'vm'
      };
  });
}());
