(function () {
  'use strict';

  angular.module('exceptionless.billing', [
    'angularPayments',
    'angular-stripe',
    'ui.bootstrap',

    'dialogs.main',
    'dialogs.default-translations',

    'app.config',
    'exceptionless',
    'exceptionless.admin',
    'exceptionless.autofocus',
    'exceptionless.dialog',
    'exceptionless.notification',
    'exceptionless.organization',
    'exceptionless.promise-button',
    'exceptionless.user',
    'exceptionless.refresh'
  ]);
}());
