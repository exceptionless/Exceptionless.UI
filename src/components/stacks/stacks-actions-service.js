﻿(function () {
  'use strict';

  angular.module('exceptionless.stacks')
    .factory('stacksActionsService', ['$ExceptionlessClient', 'dialogService', 'stackService', 'notificationService', '$q', function ($ExceptionlessClient, dialogService, stackService, notificationService, $q) {
      var source = 'exceptionless.stacks.stacksActionsService';

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
          return dialogService.confirmDanger('Are you sure you want to delete these stacks?', 'DELETE STACKS').then(function () {
            function onSuccess() {
              notificationService.success('Successfully deleted the stacks.');
            }

            function onFailure() {
              $ExceptionlessClient.createFeatureUsage(source + '.delete.error').setProperty('count', ids.length).submit();
              notificationService.error('An error occurred while deleting the stacks.');
            }

            return executeAction(ids, stackService.remove, onSuccess, onFailure);
          });
        }
      };

      var markFixedAction = {
        name: 'Mark Fixed',
        run: function (ids) {
          function onSuccess() {
            notificationService.success('Successfully marked stacks as fixed.');
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-fixed.error').setProperty('count', ids.length).submit();
            notificationService.error('An error occurred while marking stacks as fixed.');
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-fixed').setProperty('count', ids.length).submit();
          return executeAction(ids, stackService.markFixed, onSuccess, onFailure);
        }
      };

      var markNotFixedAction = {
        name: 'Mark Not Fixed',
        run: function (ids) {
          function onSuccess() {
            notificationService.success('Successfully marked stacks as not fixed.');
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-not-fixed.error').setProperty('count', ids.length).submit();
            notificationService.error('An error occurred while marking stacks as not fixed.');
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-not-fixed').setProperty('count', ids.length).submit();
          return executeAction(ids, stackService.markNotFixed, onSuccess, onFailure);
        }
      };

      var markHiddenAction = {
        name: 'Mark Hidden',
        run: function (ids) {
          function onSuccess() {
            notificationService.success('Successfully marked stacks as hidden.');
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-hidden.error').setProperty('count', ids.length).submit();
            notificationService.error('An error occurred while marking stacks as hidden.');
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-hidden').setProperty('count', ids.length).submit();
          return executeAction(ids, stackService.markHidden, onSuccess, onFailure);
        }
      };

      var markNotHiddenAction = {
        name: 'Mark Not Hidden',
        run: function (ids) {
          function onSuccess() {
            notificationService.success('Successfully marked stacks as not hidden.');
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.mark-not-hidden.error').setProperty('count', ids.length).submit();
            notificationService.error('An error occurred while marking stacks as not hidden.');
          }

          $ExceptionlessClient.createFeatureUsage(source + '.mark-not-hidden').setProperty('count', ids.length).submit();
          return executeAction(ids, stackService.markNotHidden, onSuccess, onFailure);
        }
      };

      function getActions() {
        return [markFixedAction, markNotFixedAction, markHiddenAction, markNotHiddenAction, deleteAction];
      }

      var service = {
        getActions: getActions
      };

      return service;
    }]);
}());
