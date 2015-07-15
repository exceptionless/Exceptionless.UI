(function () {
  'use strict';

  angular.module('exceptionless.signalr', [
    'SignalR',

    'app.config',
    'exceptionless',
    'exceptionless.auth'
  ])
  .factory('signalRService', ['$ExceptionlessClient', '$rootScope', '$timeout', 'authService', 'BASE_URL', 'Hub', function ($ExceptionlessClient, $rootScope, $timeout, authService, BASE_URL, Hub) {
    var source = 'exceptionless.signalr.signalRService';
    var _hub;
    var _signalRTimeout;

    function start() {
      startDelayed(1);
    }

    function startDelayed(delay) {
      if (_hub || _signalRTimeout) {
        stop();
      }

      _signalRTimeout = $timeout(function () {
        _hub = new Hub('messages', {
          rootPath: BASE_URL + '/api/v2/push',

          // client side methods
          listeners: {
            'releaseNotification': function (releaseNotification) {
              $rootScope.$emit('notification:release', releaseNotification);
            },
            'systemNotification': function (systemNotification) {
              $rootScope.$emit('notification:system', systemNotification);
            },
            'entityChanged': function (entityChanged) {
              entityChanged.added = entityChanged.change_type === 0;
              entityChanged.updated = entityChanged.change_type === 1;
              entityChanged.deleted = entityChanged.change_type === 2;

              $rootScope.$emit(entityChanged.type + 'Changed', entityChanged);
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
          stateChanged: function(state) {
            if (state.newState === $.signalR.connectionState.disconnected && authService.isAuthenticated()) {
              stop();
              start();
            }
          }
        });
      }, delay || 1000);
    }

    function stop() {
      if (_hub) {
        _hub.disconnect();
        _hub = null;
      }

      if (_signalRTimeout) {
        $timeout.cancel(_signalRTimeout);
        _signalRTimeout = null;
      }
    }

    var service = {
      start: start,
      startDelayed: startDelayed,
      stop: stop
    };

    return service;
  }]);
}());
