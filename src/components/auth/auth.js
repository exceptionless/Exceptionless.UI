(function () {
  'use strict';

  angular.module('exceptionless.auth', [
    'satellizer',
    'ui.router',

    'app.config',
    'exceptionless.notification',
    'exceptionless.state'
  ])
  .config(['$authProvider', 'BASE_URL', 'FACEBOOK_APPID', 'GOOGLE_APPID', 'GITHUB_APPID', 'LIVE_APPID', function ($authProvider, BASE_URL, FACEBOOK_APPID, GOOGLE_APPID, GITHUB_APPID, LIVE_APPID) {
    $authProvider.loginUrl = BASE_URL + '/auth/login';
    $authProvider.loginRedirect = null;
    $authProvider.logoutRedirect = '/login';
    $authProvider.signupUrl = BASE_URL + '/auth/signup';
    $authProvider.unlinkUrl = BASE_URL + '/auth/unlink/';

    $authProvider.facebook({
      clientId: FACEBOOK_APPID,
      url: BASE_URL + '/auth/facebook'
    });

    $authProvider.google({
      clientId: GOOGLE_APPID,
      url: BASE_URL + '/auth/google'
    });

    $authProvider.github({
      clientId: GITHUB_APPID,
      url: BASE_URL + '/auth/github'
    });

    $authProvider.live({
      clientId: LIVE_APPID,
      url: BASE_URL + '/auth/live'
    });
  }]);
}());
