(function () {
  'use strict';

  angular.module('exceptionless.billing', [
    'angularPayments',
    'angular-stripe',
    'ui.bootstrap',

    'dialogs.main',
    'dialogs.default-translations',

    'exceptionless.admin',
    'exceptionless.notification',
    'exceptionless.organization',
    'exceptionless.user',
    'exceptionless.refresh'
  ]);
}());
