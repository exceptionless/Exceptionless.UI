(function () {
  'use strict';

  angular.module('exceptionless.log-level', [
    'ui.bootstrap',

    'exceptionless.notification',
    'exceptionless.organization',
    'exceptionless.project',
    'exceptionless.refresh',
    'exceptionless.translate'
  ])
  .directive('logLevel', [function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        projectId: '=',
        source: '='
      },
      templateUrl: 'components/log-level/log-level-directive.tpl.html',
      controller: function ($scope, notificationService, projectService, translateService) {
        var vm = this;

        function get() {
          function onSuccess(response) {
            var configSettings = response.data.plain().settings;
            console.log(configSettings);
            vm.level = getMinLogLevel(configSettings, vm.source);
            vm.defaultLevel = getMinLogLevel(configSettings) || 'Trace';
          }

          function onFailure(response) {
          }

          return projectService.getConfig(vm.projectId).then(onSuccess, onFailure);
        }

        function setLogLevel(level) {
          function onFailure() {
            notificationService.error(translateService.T('An error occurred while saving the configuration setting.'));
          }

          return projectService.setConfig(vm.projectId, '@@log:' + vm.source, level).catch(onFailure);
        }

        function setDefaultLogLevel() {
          function onFailure() {
            notificationService.error(translateService.T('An error occurred while trying to delete the configuration setting.'));
          }

          return projectService.removeConfig(vm.projectId, '@@log:' + vm.source).catch(onFailure);
        }

        function getLogLevel(level) {
          switch ((level || '').toLowerCase().trim()) {
            case 'trace':
            case 'true':
            case '1':
            case 'yes':
              return 'trace';
            case 'debug':
              return 'debug';
            case 'info':
              return 'info';
            case 'warn':
              return 'warn';
            case 'error':
              return 'error';
            case 'fatal':
              return 'fatal';
            case 'off':
            case 'false':
            case '0':
            case 'no':
              return 'off';
            default:
              return null;
          }
        }

        function getMinLogLevel(configSettings, loggerName) {
          if (!loggerName) {
            loggerName = '*';
          }

          return getLogLevel(getTypeAndSourceSetting(configSettings, 'log', loggerName) + '');
        }

        function getTypeAndSourceSetting(configSettings, type, source) {
          if (!type) {
            return null;
          }

          if (!configSettings) {
            configSettings = {};
          }

          var isLog = type === 'log';
          var sourcePrefix = '@@' + type + ':';

          var value = configSettings[sourcePrefix + source];
          if (value) {
            return !isLog ? toBoolean(value) : value;
          }

          // check for wildcard match
          for (var key in configSettings) {
            if (startsWith(key.toLowerCase(), sourcePrefix.toLowerCase()) && isMatch(source, [key.substring(sourcePrefix.length)])) {
              return !isLog ? toBoolean(configSettings[key]) : configSettings[key];
            }
          }

          return null;
        }

        function isMatch(input, patterns, ignoreCase) {
          if (!input || typeof input !== 'string') {
            return false;
          }

          if (ignoreCase === undefined) {
            ignoreCase = true;
          }

          var trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
          input = (ignoreCase ? input.toLowerCase() : input).replace(trim, '');

          return (patterns || []).some((pattern) => {
            if (typeof pattern !== 'string') {
              return false;
            }

            pattern = (ignoreCase ? pattern.toLowerCase() : pattern).replace(trim, '');
            if (pattern.length <= 0) {
              return false;
            }

            var startsWithWildcard = pattern[0] === '*';
            if (startsWithWildcard) {
              pattern = pattern.slice(1);
            }

            var endsWithWildcard = pattern[pattern.length - 1] === '*';
            if (endsWithWildcard) {
              pattern = pattern.substring(0, pattern.length - 1);
            }

            if (startsWithWildcard && endsWithWildcard) {
              return pattern.length <= input.length && input.indexOf(pattern, 0) !== -1;
            }

            if (startsWithWildcard) {
              return endsWith(input, pattern);
            }

            if (endsWithWildcard) {
              return startsWith(input, pattern);
            }

            return input === pattern;
          });
        }

        function isEmpty(input) {
          return input === null || (typeof (input) === 'object' && Object.keys(input).length === 0);
        }

        function startsWith(input, prefix) {
          return input.substring(0, prefix.length) === prefix;
        }

        function endsWith(input, suffix) {
          return input.indexOf(suffix, input.length - suffix.length) !== -1;
        }

        function toBoolean(input) {
          if (typeof input === 'boolean') {
            return input;
          }

          if (input === null || typeof input !== 'number' && typeof input !== 'string') {
            return false;
          }

          switch ((input + '').toLowerCase().trim()) {
            case 'true':
            case 'yes':
            case '1':
              return true;
            case 'false':
            case 'no':
            case '0':
            case null:
              return false;
          }

          return false;
        }

        this.$onInit = function $onInit() {
          vm.level = null;
          vm.defaultLevel = null;
          vm.projectId = $scope.projectId;
          vm.setLogLevel = setLogLevel;
          vm.setDefaultLogLevel = setDefaultLogLevel;
          vm.source = $scope.source;

          return get();
        };
      },
      controllerAs: 'vm'
    };
  }]);
}());
