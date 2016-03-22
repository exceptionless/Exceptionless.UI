/* global li:false, queryString: false */
(function () {
  'use strict';

  angular.module('exceptionless.link', [])
    .factory('linkService', [function () {
      function getLinks(linkHeader) {
        if (linkHeader == null)
          return {};

        return li.parse(linkHeader || {});
      }

      function getLinksQueryParameters(linkHeader) {
        var parsedLinks = getLinks(linkHeader);
        var links = {};
        for (var rel in parsedLinks) {
          var url = parsedLinks[rel];
          links[rel] = parseQueryString(url.slice(url.indexOf('?')));
        }

        return links;
      }

      function parseQueryString(input) {
        // Source import from https://github.com/sindresorhus/query-string due to lack of browser support (node / requirejs).
        if (typeof input !== 'string') {
          return {};
        }

        input = input.trim().replace(/^(\?|#|&)/, '');
        if (!input) {
          return {};
        }

        return input.split('&').reduce(function (previous, param) {
          var parts = param.replace(/\+/g, ' ').split('=');
          // Firefox (pre 40) decodes `%3D` to `=`
          // https://github.com/sindresorhus/query-string/pull/37
          var key = parts.shift();
          var val = parts.length > 0 ? parts.join('=') : undefined;

          key = decodeURIComponent(key);

          // missing `=` should be `null`:
          // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
          val = val === undefined ? null : decodeURIComponent(val);

          if (!previous.hasOwnProperty(key)) {
            previous[key] = val;
          } else if (Array.isArray(previous[key])) {
            previous[key].push(val);
          } else {
            previous[key] = [previous[key], val];
          }

          return previous;
        }, {});
      }

      var service = {
        getLinks: getLinks,
        getLinksQueryParameters: getLinksQueryParameters
      };

      return service;
    }]);
}());
