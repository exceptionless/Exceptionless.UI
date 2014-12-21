(function () {
  'use strict';

  angular.module('exceptionless.intercom')
    .factory('intercomService', ['$intercom', 'INTERCOM_APPID', function ($intercom, INTERCOM_APPID) {
      function boot(data) {
        return $intercom.boot(angular.extend({}, { app_id: INTERCOM_APPID }, data));
      }

      function hide() {
        return $intercom.hide();
      }

      function update(data) {
        return $intercom.update(angular.extend({}, { app_id: INTERCOM_APPID }, data));
      }

      function trackEvent(eventName, data) {
        return $intercom.trackEvent(eventName, angular.extend({}, { app_id: INTERCOM_APPID }, data));
      }

      function shutdown() {
        return $intercom.shutdown();
      }

      function show() {
        return $intercom.show();
      }

      var service = {
        boot: boot,
        hide: hide,
        update: update,
        trackEvent: trackEvent,
        shutdown: shutdown,
        show: show
      };

      return service;
    }]);
}());
