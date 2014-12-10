(function () {
  'use strict';

  angular.module('exceptionless.date-filter', [
    'ui.bootstrap',

    'dialogs.main',
    'dialogs.default-translations',

    'exceptionless.date-picker',
    'exceptionless.date-range-parser',
    'exceptionless.refresh'
  ]);
}());
