(function () {
  'use strict';

  angular.module('exceptionless.events', [
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
