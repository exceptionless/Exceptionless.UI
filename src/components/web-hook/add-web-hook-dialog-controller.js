(function () {
  'use strict';

  angular.module('exceptionless.web-hook')
    .controller('AddWebHookDialog', ['$ExceptionlessClient', '$uibModalInstance', function ($ExceptionlessClient, $uibModalInstance) {
      var source = 'exceptionless.web-hook.AddWebHookDialog';
      var vm = this;

      function cancel() {
        $ExceptionlessClient.submitFeatureUsage(source + '.cancel');
        $uibModalInstance.dismiss('cancel');
      }

      function getEventTypes() {
        return [
          {
            key: 'NewError',
            name: 'New Error',
            description: 'Occurs when a new error that has never been seen before is reported to your project.'
          },
          {
            key: 'CriticalError',
            name: 'Critical Error',
            description: 'Occurs when an error that has been marked as critical is reported to your project.'
          },
          {
            key: 'StackRegression',
            name: 'Regression',
            description: 'Occurs when an event that has been marked as fixed has reoccurred in your project.'
          },
          {
            key: 'NewEvent',
            name: 'New Event',
            description: 'Occurs when a new event that has never been seen before is reported to your project.'
          },
          {
            key: 'CriticalEvent',
            name: 'Critical Event',
            description: 'Occurs when an event that has been marked as critical is reported to your project.'
          },
          {
            key: 'StackPromoted',
            name: 'Promoted',
            description: 'Used to promote event stacks to external systems.'
          }
        ];
      }

      function hasEventTypeSelection() {
        return vm.data.event_types && vm.data.event_types.length > 0;
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        $ExceptionlessClient.createFeatureUsage(source + '.save').setProperty('WebHook', vm.data).submit();
        $uibModalInstance.close(vm.data);
      }

      vm.addWebHookForm = {};
      vm.cancel = cancel;
      vm.data = { };
      vm.eventTypes = getEventTypes();
      vm.hasEventTypeSelection = hasEventTypeSelection;
      vm.save = save;

      $ExceptionlessClient.submitFeatureUsage(source);
    }]);
}());
