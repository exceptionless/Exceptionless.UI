(function () {
  'use strict';

  angular.module('app.auth', [
    'directives.inputMatch',
    'ngMessages',
    'satellizer',
    'ui.router',

    'app.config',
    'exceptionless.auth',
    'exceptionless.notification',
    'exceptionless.project',
    'exceptionless.rate-limit',
    'exceptionless.user',
    'exceptionless.validators'
  ])
  .config(['$authProvider', '$stateProvider', 'BASE_URL', 'FACEBOOK_APPID', 'GOOGLE_APPID', 'GITHUB_APPID', 'LIVE_APPID', function ($authProvider, $stateProvider, BASE_URL, FACEBOOK_APPID, GOOGLE_APPID, GITHUB_APPID, LIVE_APPID) {
    $authProvider.loginUrl = BASE_URL + '/auth/login';
    $authProvider.loginRedirect = false;
    $authProvider.logoutRedirect = '/login';
    $authProvider.signupUrl = BASE_URL + '/auth/signup';
    $authProvider.signupRedirect = false;
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
      url: BASE_URL + '/auth/github',
      optionalUrlParams: ['scope'],
      scope: ['user:email']
    });

    $authProvider.live({
      clientId: LIVE_APPID,
      url: BASE_URL + '/auth/live',
      scope: ['wl.basic', 'wl.emails']
    });

    $stateProvider.state('auth', {
      abstract: true,
      template: '<ui-view autoscroll="true" />'
    });

    $stateProvider.state('auth.forgot-password', {
      url: '/forgot-password',
      controller: 'auth.ForgotPassword',
      controllerAs: 'vm',
      templateUrl: 'app/auth/forgot-password.tpl.html'
    });

    $stateProvider.state('auth.login', {
      url: '/login',
      controller: 'auth.Login',
      controllerAs: 'vm',
      templateUrl: 'app/auth/login.tpl.html'
    });

    $stateProvider.state('auth.logout', {
      url: '/logout',
      template: null,
      controller: 'auth.Logout'
    });

    $stateProvider.state('auth.reset-password', {
      url: '/reset-password/:token',
      controller: 'auth.ResetPassword',
      controllerAs: 'vm',
      templateUrl: 'app/auth/reset-password.tpl.html'
    });

    $stateProvider.state('auth.signup', {
      url: '/signup?token',
      controller: 'auth.Signup',
      controllerAs: 'vm',
      templateUrl: 'app/auth/signup.tpl.html'
    });
  }]);
}());
