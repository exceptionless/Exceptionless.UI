(function () {
  'use strict';

  angular.module('exceptionless.auth', [
    'angular-locker',
    'restangular',
    'satellizer'
  ])
  .factory('authService', ['$location', '$state', 'Restangular', 'locker', function ($location, $state, Restangular, locker) {
    var _store = locker.driver('session').namespace('auth');

    function clearPreviousState() {
      _store.forget(['name', 'params']);
    }

    function redirectToPreviousState() {
      var name = _store.pull('name');
      var params = _store.pull('params') || {};

      if (name) {
        return $state.go(name, params);
      }

      return $location.path('/');
    }

    function saveCurrentState() {
      if (_store.has('name')) {
        return;
      }

      _store.put('name', $state.current.name);
      _store.put('params', $state.params);
    }

    var service = {
      clearPreviousState: clearPreviousState,
      redirectToPreviousState: redirectToPreviousState,
      saveCurrentState: saveCurrentState
    };

    return service;
  }]);
}());
