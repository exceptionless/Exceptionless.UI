(function () {
  'use strict';

  angular.module('app.event')
    .controller('Reference', ['eventService', 'notificationService', '$state', '$stateParams', function (eventService, notificationService, $state, $stateParams) {
      var vm = this;
      var _referenceId = $stateParams.referenceId;

      function getByReferenceId(options) {
        return eventService.getByReferenceId(_referenceId, options).then(function(response) {
          var events = response.data.plain();
          if (events.length === 0) {
            $state.go('app.dashboard');
            notificationService.error('No events with reference id "' + _referenceId + '" could not be found.');
          } else if (events.length === 1) {
            $state.go('app.event', { id: events[0].id });
          }

          return response;
        });
      }

      vm.references = {
        get: getByReferenceId,
        options: {
          limit: 20,
          mode: 'summary'
        },
        source: 'app.event.Reference'
      };
    }]);
}());
