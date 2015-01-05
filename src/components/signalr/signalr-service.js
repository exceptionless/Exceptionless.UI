(function () {
  'use strict';

  angular.module('exceptionless.signalr', [
    'SignalR',

    'exceptionless.auth',
    'app.config'
  ])
  .factory('signalRService', ['$rootScope', '$timeout', '$log', 'authService', 'BASE_URL', 'Hub', function ($rootScope, $timeout, $log, authService, BASE_URL, Hub) {
    var signalR;

    function start() {
      startDelayed(0);
    }

    function startDelayed(delay) {
      if (signalR)
        stop();

      signalR = $timeout(function (){
        var hub = new Hub('messages', {
          rootPath: BASE_URL + '/push',

          // client side methods
          listeners: {
            'entityChanged': function (entityChanged) {
              entityChanged.added = entityChanged.change_type === 0;
              entityChanged.updated = entityChanged.change_type === 1 || entityChanged.change_type === 4;
              entityChanged.deleted = entityChanged.change_type === 2 || entityChanged.change_type === 3;

              $rootScope.$emit(entityChanged.type + 'Changed', entityChanged);
            },
            'eventOccurrence': function (eventOccurrence) {
              $rootScope.$emit('eventOccurrence', eventOccurrence);
            },
            'stackUpdated': function (stackUpdated) {
              $rootScope.$emit('stackUpdated', stackUpdated);
            },
            'planOverage': function (planOverage) {
              $rootScope.$emit('planOverage', planOverage);
            },
            'planChanged': function (planChanged) {
              $rootScope.$emit('planChanged', planChanged);
            },
            'userMembershipChanged': function (userMembershipChanged) {
              // This event is fired when a user is added or removed from an organization.
              if (userMembershipChanged && userMembershipChanged.organization_id){
                $rootScope.$emit('OrganizationChanged', userMembershipChanged);
                $rootScope.$emit('ProjectChanged', userMembershipChanged);
              }
            }
          },

          queryParams: {
            'access_token': authService.getToken()
          },

          // handle connection error
          errorHandler: function (error) {
            $log.error(error);
          }
        });
      }, delay || 1000);
    }

    function stop() {
      if (!signalR)
        return;

      $timeout.cancel(signalR);
      signalR = null;
    }

    var service = {
      start: start,
      startDelayed: startDelayed,
      stop: stop
    };

    return service;
  }]);
}());
