(function () {
  'use strict';

  angular.module('exceptionless.intercom', [
    'ngIntercom',

    'app.config'
  ])
  .config(['IntercomServiceProvider', function (IntercomServiceProvider) {
      IntercomServiceProvider.asyncLoading(true);
  }]);
}());
