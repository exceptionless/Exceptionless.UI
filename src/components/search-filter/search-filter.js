(function () {
  'use strict';

  angular.module('exceptionless.search-filter', [
    'ngMessages',

    'exceptionless',
    'exceptionless.autofocus',
    'exceptionless.date-filter',
    'exceptionless.project-filter',
    'exceptionless.refresh',
    'exceptionless.validators'
  ]);
}());
