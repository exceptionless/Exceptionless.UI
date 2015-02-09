(function () {
  'use strict';

  angular.module('app.config', [])
    .constant('BASE_URL', 'http://localhost:50000/api/v2')
    .constant('FACEBOOK_APPID')
    .constant('GITHUB_APPID')
    .constant('GOOGLE_APPID')
    .constant('INTERCOM_APPID')
    .constant('LIVE_APPID')
    .constant('STRIPE_PUBLISHABLE_KEY')
    .constant('SYSTEM_NOTIFICATION_MESSAGE')
    .constant('USE_HTML5_MODE', false)
    .constant('USE_SSL', false)
    .constant('VERSION', '2.0.0');
}());
