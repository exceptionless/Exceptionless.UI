(function () {
  'use strict';

  angular.module('exceptionless.signalr', [
    'app.config',
    'exceptionless',
    'exceptionless.auth'
  ])
  .factory('signalRService', ['$ExceptionlessClient', '$rootScope', '$interval', '$timeout', 'authService', 'BASE_URL', function ($ExceptionlessClient, $rootScope, $interval, $timeout, authService, BASE_URL) {
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
      _connection.received(function (json) {
        var typedMessage = JSON.parse(json);
        if (typedMessage.message.change_type) {
          typedMessage.message.added = typedMessage.message.change_type === 0;
          typedMessage.message.updated = typedMessage.message.change_type === 1;
          typedMessage.message.deleted = typedMessage.message.change_type === 2;
        }

        $rootScope.$emit(typedMessage.type, typedMessage.message);

        // This event is fired when a user is added or removed from an organization.
        if (typedMessage.type === 'UserMembershipChanged' && typedMessage.message.organization_id) {
          $rootScope.$emit('OrganizationChanged', typedMessage.message);
          $rootScope.$emit('ProjectChanged', typedMessage.message);
        }
      });

      _connection.stateChanged(function (change) {
        if (change.newState === $.signalR.connectionState.disconnected && authService.isAuthenticated()) {
          _reconnectInterval = $interval(function() {
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
  }]);
}());
