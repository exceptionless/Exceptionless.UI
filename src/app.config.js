(function () {
  'use strict';

  angular.module('app.config', [])
    //.constant('BASE_URL', 'http://localhost:50000')
    .constant('BASE_URL', 'http://192.168.88.20:10240')
    .constant('LANGUAGE','zh-cn')
    .constant('EXCEPTIONLESS_API_KEY')
    .constant('FACEBOOK_APPID')
    .constant('GITHUB_APPID')
    .constant('GOOGLE_APPID')
    .constant('INTERCOM_APPID')
    .constant('LIVE_APPID')
    .constant('SLACK_APPID')
    .constant('STRIPE_PUBLISHABLE_KEY')
    .constant('SYSTEM_NOTIFICATION_MESSAGE')
    .constant('USE_HTML5_MODE', false)
    .constant('USE_SSL', false);
}());
