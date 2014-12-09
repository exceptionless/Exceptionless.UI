(function () {
  'use strict';

  angular.module('app.auth', [
    'ui.router',

    'exceptionless.auth',
    'exceptionless.notification',
    'exceptionless.user'
  ])
  .config(['$stateProvider', function ($stateProvider) {
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
      url: '/signup',
      controller: 'auth.Signup',
      controllerAs: 'vm',
      templateUrl: 'app/auth/signup.tpl.html'
    });
  }]);
}());
