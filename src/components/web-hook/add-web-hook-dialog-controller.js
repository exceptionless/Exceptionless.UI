(function () {
  'use strict';

  angular.module('exceptionless.web-hook')
    .controller('AddWebHookDialog', function ($ExceptionlessClient, $uibModalInstance) {
      var vm = this;
      function cancel() {
        $ExceptionlessClient.submitFeatureUsage(vm._source + '.cancel');
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
            key: 'Error',
            name: 'Error',
            description: 'Occurs when a error.'
          },
		  {
            key: 'LogWarn',
            name: 'LogWarn',
            description: 'Occurs when a log warn.'
          },
		  {
            key: 'LogError',
            name: 'LogError',
            description: 'Occurs when a log error.'
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

        $ExceptionlessClient.createFeatureUsage(vm._source + '.save').setProperty('WebHook', vm.data).submit();
        $uibModalInstance.close(vm.data);
      }

      this.$onInit = function $onInit() {
        vm._source = 'exceptionless.web-hook.AddWebHookDialog';
        vm.addWebHookForm = {};
        vm.cancel = cancel;
        vm.data = {};
        vm.eventTypes = getEventTypes();
        vm.hasEventTypeSelection = hasEventTypeSelection;
        vm.save = save;

        $ExceptionlessClient.submitFeatureUsage(vm._source);
      };
    });
}());
