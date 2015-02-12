/*global UAParser:false */

(function () {
  'use strict';

  angular.module('exceptionless.user-agent', [])
    .factory('userAgentService', [function () {
      function getUserAgent(userAgent) {
        var parser = new UAParser();
        parser.setUA(userAgent);
        return parser.getResult();
      }

      function getBrowser(userAgent) {
        var browser = getUserAgent(userAgent).browser;
        return browser.name + ' ' + browser.version;
      }

      function getBrowserOS(userAgent) {
        var os = getUserAgent(userAgent).os;
        return os.name + ' ' + os.version;
      }

      function getDevice(userAgent) {
        var device = getUserAgent(userAgent).device;
        return device.model;
      }

      function hasBrowser(userAgent) {
        if (!userAgent) {
          return false;
        }
        var browser = getUserAgent(userAgent).browser;
        return !!browser.name || !!browser.version || !!browser.major;
      }

      function hasBrowserOS(userAgent) {
        if (!userAgent) {
          return false;
        }
        var os = getUserAgent(userAgent).os;
        return !!os.name || !!os.version;
      }

      function hasDevice(userAgent) {
        if (!userAgent) {
          return false;
        }
        var os = getUserAgent(userAgent).os;
        return !!os.model || !!os.vendor || !!os.type;
      }

      var service = {
        getBrowser: getBrowser,
        getBrowserOS: getBrowserOS,
        getDevice: getDevice,
        hasBrowser: hasBrowser,
        hasBrowserOS: hasBrowserOS,
        hasDevice: hasDevice
      };

      return service;
    }
    ]);
}());
