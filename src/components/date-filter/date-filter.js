(function () {
  'use strict';

  angular.module('exceptionless.date-filter', [
    'ui.bootstrap',

    'dialogs.main',
    'dialogs.default-translations',

    'exceptionless',
    'exceptionless.autofocus',
    'exceptionless.date-range-parser',
    'exceptionless.date-range-picker',
    'exceptionless.refresh'
  ]);
}());
