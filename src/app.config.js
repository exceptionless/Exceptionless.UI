(function () {
  'use strict';

  angular.module('app.config', ['satellizer'])
    .constant('AUTH_CLIENT_IDS', {
      facebook: '395178683904310',
      google: '86088244242-6ihnf99upp3a2g5sp13joerdo1i5f29l.apps.googleusercontent.com',
      github: 'fdb0fdc666419c4cd3e9',
      live: '0000000044132A07'
    })
    .constant('BASE_URL', 'http://localhost:50000/api/v2')
    .constant('VERSION', '2.0.0');
}());
