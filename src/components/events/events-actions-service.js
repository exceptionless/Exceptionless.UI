(function () {
  'use strict';

  angular.module('exceptionless.events')
    .factory('eventsActionsService', function ($ExceptionlessClient, dialogService, eventService, notificationService, $q) {
      var source = 'exceptionless.events.eventsActionsService';

      var deleteAction = {
        name: 'Delete',
        run: function (ids) {
          $ExceptionlessClient.createFeatureUsage(source + '.delete').setProperty('count', ids.length).submit();
          return dialogService.confirmDanger('Are you sure you want to delete these events?', 'DELETE EVENTS').then(function () {
            function onSuccess() {
              notificationService.info('Successfully queued the events for deletion.');
            }

            function onFailure() {
              $ExceptionlessClient.createFeatureUsage(source + '.delete.error').setProperty('count', ids.length).submit();
              notificationService.error('An error occurred while deleting the events.');
            }

            var deferred = $q.defer();
            var promise = _.chunk(ids, 10).reduce(function (previous, item) {
              return previous.then(eventService.remove(item.join(',')));
            }, deferred.promise).then(onSuccess, onFailure);

            deferred.resolve();
            return promise;
          }).catch(function(e){});
        }
      };

      function getActions() {
        return [deleteAction];
      }

      var service = {
        getActions: getActions
      };

      return service;
    });
}());
