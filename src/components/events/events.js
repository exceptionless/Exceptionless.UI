(function () {
  'use strict';

  angular.module('exceptionless.events', [
    'dialogs.default-translations',
    'dialogs.main',
    'checklist-model',
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
