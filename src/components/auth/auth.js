(function () {
  'use strict';

  angular.module('exceptionless.auth', [
    'angular-locker',
    'restangular',
    'satellizer',
    'ui.router',

    'app.config'
  ])
  .config(['$authProvider', 'FACEBOOK_APPID', 'GOOGLE_APPID', 'GITHUB_APPID', 'LIVE_APPID', 'BASE_URL', function ($authProvider, FACEBOOK_APPID, GOOGLE_APPID, GITHUB_APPID, LIVE_APPID, BASE_URL) {
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
  }])
  .run(['$state', 'authService', 'Restangular', function($state, authService, Restangular) {
    Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
      if(response.status !== 401) {
        return true;
      }

      authService.saveCurrentState();
      $state.go('auth.login');
      return false;
    });
  }]);
}());
