(function () {
  'use strict';

  angular.module('exceptionless.intercom', [
    'ngIntercom',

    'app.config'
  ])
  .config(['IntercomServiceProvider', 'INTERCOM_APPID', function (IntercomServiceProvider, INTERCOM_APPID) {
      if (!INTERCOM_APPID) {
        return;
      }

      IntercomServiceProvider.asyncLoading(true).scriptUrl('https://widget.intercom.io/widget/' + INTERCOM_APPID);
  }]);
}());
