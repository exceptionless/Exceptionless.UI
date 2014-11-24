(function () {
  'use strict';

  angular.module('exceptionless.stacks', [
    'checklist-model',
    'exceptionless.refresh',
    'exceptionless.link',
    'exceptionless.notification',
    'exceptionless.pagination',
    'exceptionless.summary',
    'exceptionless.timeago',

    // Custom dialog dependencies
    'ui.bootstrap',
    'dialogs.main',
    'dialogs.default-translations'
  ]);
}());
