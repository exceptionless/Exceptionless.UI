(function () {
  'use strict';

  angular.module('exceptionless.events', [
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
