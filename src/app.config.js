(function () {
  'use strict';

  angular.module('app.config', ['satellizer'])
    .constant('BASE_URL', 'http://localhost:50000/api/v2')
    .constant('FACEBOOK_APPID')
    .constant('GITHUB_APPID')
    .constant('GOOGLE_APPID')
    .constant('INTERCOM_APPID')
    .constant('LIVE_APPID')
    .constant('STRIPE_PUBLISHABLE_KEY')
    .constant('VERSION', '2.0.0');
}());
