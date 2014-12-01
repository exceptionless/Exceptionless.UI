(function () {
  'use strict';

  angular.module('app.config', ['satellizer'])
    .constant('BASE_URL', 'http://localhost:50000')
    .constant('VERSION', '2.0.0')
    .config(function($authProvider) {
      $authProvider.facebook({
        clientId: ''
      });

      $authProvider.google({
        clientId: ''
      });

      $authProvider.github({
        clientId: ''
      });

      $authProvider.live({
        clientId: ''
      });
    });
}());
