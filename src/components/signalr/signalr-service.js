(function () {
  'use strict';

  angular.module('exceptionless.signalr', [
    'app.config',
    'exceptionless',
    'exceptionless.auth'
  ])
  .factory('signalRService', function ($ExceptionlessClient, $rootScope, $interval, $timeout, authService, BASE_URL) {
    var source = 'exceptionless.signalr.signalRService';
    var _connection;
    var _signalRTimeout;
    var _reconnectInterval;

    function start() {
      startDelayed(1);
    }

    function startDelayed(delay) {
      if (_connection || _signalRTimeout || _reconnectInterval) {
        stop();
      }

      _connection = $.connection(BASE_URL + '/api/v2/push', { access_token: authService.getToken() });
      _connection.received(function (data) {
        if (!data || typeof data === 'string') {
          return;
        }

        if (data.message && data.message.change_type) {
          data.message.added = data.message.change_type === 0;
          data.message.updated = data.message.change_type === 1;
          data.message.deleted = data.message.change_type === 2;
        }

        $rootScope.$emit(data.type, data.message);

        // This event is fired when a user is added or removed from an organization.
        if (data.type === 'UserMembershipChanged' && data.message && data.message.organization_id) {
          $rootScope.$emit('OrganizationChanged', data.message);
          $rootScope.$emit('ProjectChanged', data.message);
        }
      });

      _connection.stateChanged(function (change) {
        if (change.newState === $.signalR.connectionState.disconnected && authService.isAuthenticated()) {
          _reconnectInterval = $interval(function() {
            if (!_connection) {
              return $interval.cancel(_reconnectInterval);
            }

            _connection.start().then(function() {
              $interval.cancel(_reconnectInterval);
            });
          }, 5000);
        }
      });

      _signalRTimeout = $timeout(function () {
        _connection.start();
      }, delay || 1000);
    }

    function stop() {
      if (_signalRTimeout) {
        $timeout.cancel(_signalRTimeout);
        _signalRTimeout = null;
      }

      if (_reconnectInterval) {
        $interval.cancel(_reconnectInterval);
        _reconnectInterval = null;
      }

      if (_connection) {
        _connection.stop();
        _connection = null;
      }
    }

    var service = {
      start: start,
      startDelayed: startDelayed,
      stop: stop
    };

    return service;
  });
}());
