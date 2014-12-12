(function () {
  'use strict';

  angular.module('exceptionless.billing', [
    'angularPayments',
    'ui.bootstrap',

    'dialogs.main',
    'dialogs.default-translations',

    'exceptionless.refresh'
  ]);
}());
