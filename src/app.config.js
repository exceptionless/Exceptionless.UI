(function () {
  'use strict';

  angular.module('app.config', [])
  .constant("BASE_URL", "https://api.exceptionless.io")
    .constant('ENABLE_SIGNUP', false)
    .constant("EXCEPTIONLESS_API_KEY", "LbGm5NmU0TO5MR9Sko7UmxslHAXsbE20YsUu0N5w")
    .constant("EXCEPTIONLESS_SERVER_URL", "https://collector.exceptionless.io")
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
