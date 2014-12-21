(function () {
  'use strict';

  angular.module('app.config', ['satellizer'])
    .constant('BASE_URL', 'http://localhost:50000/api/v2')
    .constant('FACEBOOK_APPID', '578945675582952')
    .constant('GITHUB_APPID', 'd25dcc0a074447de01d1')
    .constant('GOOGLE_APPID', '86088244242-6ihnf99upp3a2g5sp13joerdo1i5f29l.apps.googleusercontent.com')
    .constant('INTERCOM_APPID')
    .constant('LIVE_APPID', '0000000044132A07')
    .constant('STRIPE_PUBLISHABLE_KEY')
    .constant('VERSION', '2.0.0');
}());
