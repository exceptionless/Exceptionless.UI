(function () {
  'use strict';

  angular.module('app.status', [
    'restangular',
    'ui.router',

    'exceptionless.auth',
    'exceptionless.state'
  ])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('status', {
      url: '/status?redirect',
      controller: 'Status',
      controllerAs: 'vm',
      templateUrl: 'app/status/status.tpl.html'
    });
  }])
  .run(['$state', 'Restangular', 'stateService', function($state, Restangular, stateService) {
    Restangular.setErrorInterceptor(function(response) {
      if (response.status !== 0 || $state.current.name === 'status') {
        return true;
      }

      stateService.save(['auth.', 'status']);
      $state.go('status', { redirect: true });
      return false;
    });
  }]);
}());
