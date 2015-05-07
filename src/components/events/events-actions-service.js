(function () {
  'use strict';

  angular.module('exceptionless.events')
    .factory('eventsActionsService', ['$ExceptionlessClient', 'dialogService', 'eventService', 'notificationService', function ($ExceptionlessClient, dialogService, eventService, notificationService) {
      var source = 'exceptionless.events.eventsActionsService';

      var deleteAction = {
        name: 'Delete',
        run: function (ids) {
          $ExceptionlessClient.createFeatureUsage(source + '.delete').setProperty('count', ids.length).submit();
          return dialogService.confirmDanger('Are you sure you want to delete these events?', 'DELETE EVENTS').then(function () {
            function onSuccess() {
              notificationService.success('Successfully deleted the events.');
            }

            function onFailure() {
              $ExceptionlessClient.createFeatureUsage(source + '.delete.error').setProperty('count', ids.length).submit();
              notificationService.error('An error occurred while deleting the events.');
            }

            return eventService.remove(ids.join(',')).then(onSuccess, onFailure);
          });
        }
      };

      function getActions() {
        return [deleteAction];
      }

      var service = {
        getActions: getActions
      };

      return service;
    }]);
}());
