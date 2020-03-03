(function () {
  'use strict';

  angular.module('exceptionless.stacks')
    .factory('stacksActionsService', function ($ExceptionlessClient, dialogService, stackDialogService, stackService, notificationService, translateService, $q) {
      var source = 'exceptionless.stacks.stacksActionsService';

      function actionWithParameter(action, parameter) {
        return function(ids) { return action(ids, parameter); };
      }

      function executeAction(ids, action, onSuccess, onFailure) {
        var deferred = $q.defer();
        var promise = _.chunk(ids, 10).reduce(function (previous, item) {
          return previous.then(action(item.join(',')));
        }, deferred.promise).then(onSuccess, onFailure);

        deferred.resolve();
        return promise;
      }

      var deleteAction = {
        name: 'Delete',
        run: function (ids) {
          $ExceptionlessClient.createFeatureUsage(source + '.delete').setProperty('count', ids.length).submit();
          return dialogService.confirmDanger(translateService.T('Are you sure you want to delete these stacks (includes all stack events)?'), translateService.T('DELETE STACKS')).then(function () {
            function onSuccess() {
              notificationService.info(translateService.T('Successfully queued the stacks for deletion.'));
            }

            function onFailure() {
              $ExceptionlessClient.createFeatureUsage(source + '.delete.error').setProperty('count', ids.length).submit();
              notificationService.error(translateService.T('An error occurred while deleting the stacks.'));
            }

            return executeAction(ids, stackService.remove, onSuccess, onFailure);
          }).catch(function(e){});
        }
      };

      var markFixedAction = {
        name: 'Mark Fixed',
        run: function (ids) {
          $ExceptionlessClient.createFeatureUsage(source + '.mark-fixed').setProperty('count', ids.length).submit();
          return stackDialogService.markFixed().then(function (version) {
            function onSuccess() {
              notificationService.info(translateService.T('Successfully queued the stacks to be marked as fixed.'));
            }

            function onFailure() {
              $ExceptionlessClient.createFeatureUsage(source + '.mark-fixed.error').setProperty('count', ids.length).submit();
              notificationService.error(translateService.T('An error occurred while marking stacks as fixed.'));
            }

            return executeAction(ids, actionWithParameter(stackService.markFixed, version), onSuccess, onFailure);
          }).catch(function(e){});
        }
      };

      var markNotFixedAction = {
        name: 'Mark Not Fixed',
        run: function (ids) {
          function onSuccess() {
            notificationService.info(translateService.T('Successfully queued the stacks to be marked as not fixed.'));
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-not-fixed.error').setProperty('count', ids.length).submit();
            notificationService.error(translateService.T('An error occurred while marking stacks as not fixed.'));
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-not-fixed').setProperty('count', ids.length).submit();
          return executeAction(ids, actionWithParameter(stackService.changeStatus, "open"), onSuccess, onFailure);
        }
      };

      var markIgnoredAction = {
        name: 'Mark Ignored',
        run: function (ids) {
          function onSuccess() {
            notificationService.info(translateService.T('Successfully queued the stacks to be marked as ignored.'));
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-ignored.error').setProperty('count', ids.length).submit();
            notificationService.error(translateService.T('An error occurred while marking stacks as ignored.'));
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-ignored').setProperty('count', ids.length).submit();
          return executeAction(ids, actionWithParameter(stackService.changeStatus, "ignored"), onSuccess, onFailure);
        }
      };

      var markNotIgnoredAction = {
        name: 'Mark Not Ignored',
        run: function (ids) {
          function onSuccess() {
            notificationService.info(translateService.T('Successfully queued the stacks to be marked as not ignored.'));
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-not-ignored.error').setProperty('count', ids.length).submit();
            notificationService.error(translateService.T('An error occurred while marking stacks as not ignored.'));
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-not-ignored').setProperty('count', ids.length).submit();
          return executeAction(ids, actionWithParameter(stackService.changeStatus, "open"), onSuccess, onFailure);
        }
      };

      var markDiscardedAction = {
        name: 'Mark Discarded',
        run: function (ids) {
          function onSuccess() {
            notificationService.info(translateService.T('Successfully queued the stacks to be marked as discarded.'));
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-discarded.error').setProperty('count', ids.length).submit();
            notificationService.error(translateService.T('An error occurred while marking stacks as discarded.'));
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-discarded').setProperty('count', ids.length).submit();
          return executeAction(ids, actionWithParameter(stackService.changeStatus, "discarded"), onSuccess, onFailure);
        }
      };

      var markNotDiscardedAction = {
        name: 'Mark Not Discarded',
        run: function (ids) {
          function onSuccess() {
            notificationService.info(translateService.T('Successfully queued the stacks to be marked as not discarded.'));
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-not-discarded.error').setProperty('count', ids.length).submit();
            notificationService.error(translateService.T('An error occurred while marking stacks as not discarded.'));
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-not-discarded').setProperty('count', ids.length).submit();
          return executeAction(ids, actionWithParameter(stackService.changeStatus, "open"), onSuccess, onFailure);
        }
      };

      function getActions() {
        return [markFixedAction, markNotFixedAction, markIgnoredAction, markNotIgnoredAction, markDiscardedAction, markNotDiscardedAction, deleteAction];
      }

      var service = {
        getActions: getActions
      };

      return service;
    });
}());
