(function () {
  'use strict';

  angular.module('exceptionless.stacks', [
    'checklist-model',
    'ui.bootstrap',

    'dialogs.main',
    'dialogs.default-translations',

    'exceptionless.filter',
    'exceptionless.link',
    'exceptionless.notification',
    'exceptionless.pagination',
    'exceptionless.refresh',
    'exceptionless.summary',
    'exceptionless.timeago'
  ]);
}());
