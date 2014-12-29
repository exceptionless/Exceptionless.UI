(function () {
  'use strict';

  angular.module('app.payment', [
    'ui.router',

    'exceptionless.organization',
    'exceptionless.rate-limit'
  ])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('payment', {
      url: '/payment/:id',
      controller: 'Payment',
      controllerAs: 'vm',
      parent: null,
      templateUrl: 'app/payment/payment.tpl.html'
    });
  }]);
}());
