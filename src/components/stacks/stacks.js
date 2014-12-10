(function () {
  'use strict';

  angular.module('exceptionless.stacks', [
    'checklist-model',
    'dialogs.default-translations',
    'dialogs.main',
    'ui.bootstrap',

    'exceptionless.filter',
    'exceptionless.link',
    'exceptionless.notification',
    'exceptionless.pagination',
    'exceptionless.refresh',
    'exceptionless.summary',
    'exceptionless.timeago'
  ]);
}());
