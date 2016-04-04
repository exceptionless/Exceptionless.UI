(function () {
  'use strict';

  angular.module('exceptionless.stacks', [
    'angular-filters',
    'checklist-model',
    'ui.bootstrap',

    'dialogs.main',
    'dialogs.default-translations',

    'exceptionless',
    'exceptionless.filter',
    'exceptionless.link',
    'exceptionless.notification',
    'exceptionless.pagination',
    'exceptionless.refresh',
    'exceptionless.summary',
    'exceptionless.timeago'
  ]);
}());
