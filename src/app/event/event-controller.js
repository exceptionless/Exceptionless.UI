(function () {
  'use strict';

  angular.module('app.event')
    .controller('Event', ['$ExceptionlessClient', '$scope', '$state', '$stateParams', 'clipboard', 'errorService', 'eventService', 'filterService', 'hotkeys', 'linkService', 'notificationService', 'projectService', 'urlService', function ($ExceptionlessClient, $scope, $state, $stateParams, clipboard, errorService, eventService, filterService, hotkeys, linkService, notificationService, projectService, urlService) {
      var source = 'app.event.Event';
      var _eventId = $stateParams.id;
      var _knownDataKeys = ['error', 'simple_error', 'request', 'environment', 'user', 'user_description', 'sessionend', 'session_id', 'version'];
      var vm = this;

      function addHotKeys() {
        hotkeys.del('mod+up');
        hotkeys.del('mod+left');
        hotkeys.del('mod+right');
        hotkeys.del('mod+shift+c');

        if (vm.event.stack_id) {
          hotkeys.bindTo($scope).add({
            combo: 'mod+up',
            description: 'Go To Stack',
            callback: function () {
              $ExceptionlessClient.createFeatureUsage(source + '.hotkeys.GoToStack')
                .addTags('hotkeys')
                .setProperty('id', _eventId)
                .submit();

              $state.go('app.stack', {id: vm.event.stack_id});
            }
          });

          if (clipboard.supported) {
            hotkeys.bindTo($scope).add({
              combo: 'mod+shift+c',
              description: 'Copy Event JSON to Clipboard',
              callback: function () {
                $ExceptionlessClient.createFeatureUsage(source + '.hotkeys.CopyEventJSON')
                  .addTags('hotkeys')
                  .setProperty('id', _eventId)
                  .submit();

                console.log('hotkey');
                clipboard.copyText(vm.event_json);
                copied();
              }
            });
          }
        }

        if (vm.previous) {
          hotkeys.bindTo($scope).add({
            combo: 'mod+left',
            description: 'Previous Occurrence',
            callback: function () {
              $ExceptionlessClient.createFeatureUsage(source + '.hotkeys.PreviousOccurrence')
                .addTags('hotkeys')
                .setProperty('id', _eventId)
                .submit();

              $state.go('app.event', { id: vm.previous, tab: vm.getCurrentTab() });
            }
          });
        }

        if (vm.next) {
          hotkeys.bindTo($scope).add({
            combo: 'mod+right',
            description: 'Next Occurrence',
            callback: function () {
              $ExceptionlessClient.createFeatureUsage(source + '.hotkeys.NextOccurrence')
                .addTags('hotkeys')
                .setProperty('id', _eventId)
                .submit();

              $state.go('app.event', { id: vm.next, tab: vm.getCurrentTab() });
            }
          });
        }

      }

      function buildReferences() {
        function toSpacedWords(value) {
          value = value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
          value = value.replace(/([a-z0-9])([A-Z0-9])/g, '$1 $2');
          return value.length > 1 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        }

        vm.references = [];

        var referencePrefix = '@ref:';
        angular.forEach(vm.event.data, function(data, key) {
          if (key.startsWith(referencePrefix)) {
            vm.references.push({ id: data, name: toSpacedWords(key.slice(5)) });
          }
        });
      }

      function buildTabs(tabNameToActivate) {
        var tabIndex = 0;
        var tabs = [{index: tabIndex, title: 'Overview', template_key: 'overview'}];

        if (vm.event.reference_id && isSessionStart()) {
          tabs.push({index: ++tabIndex, title: 'Session Events', template_key: 'session'});
        }

        if (isError()) {
          if (vm.event.data['@error']) {
            tabs.push({index: ++tabIndex, title: 'Exception', template_key: 'error'});
          } else if (vm.event.data['@simple_error']) {
            tabs.push({index: ++tabIndex, title: 'Exception', template_key: 'simple-error'});
          }
        }

        if (hasRequestInfo()) {
          tabs.push({index: ++tabIndex, title: isSessionStart() ? 'Browser' : 'Request', template_key: 'request'});
        }

        if (hasEnvironmentInfo()) {
          tabs.push({index: ++tabIndex, title: 'Environment', template_key: 'environment'});
        }

        var extendedDataItems = [];
        angular.forEach(vm.event.data, function(data, key) {
          if (key === '@trace') {
            key = 'Trace Log';
          }

          if (key.startsWith('@')) {
            return;
          }

          if (isPromoted(key)) {
            tabs.push({index: ++tabIndex, title: key, template_key: 'promoted', data: data});
          } else if (_knownDataKeys.indexOf(key) < 0) {
            extendedDataItems.push({title: key, data: data});
          }
        }, tabs);

        if (extendedDataItems.length > 0) {
          tabs.push({index: ++tabIndex, title: 'Extended Data', template_key: 'extended-data', data: extendedDataItems});
        }

        vm.tabs = tabs;
        for(var index = 0; index < tabs.length; index++) {
          if (tabs[index].title !== tabNameToActivate) {
            continue;
          }

          vm.activeTabIndex = tabs[index].index;
          break;
        }

        if (vm.activeTabIndex >= vm.tabs.length) {
          vm.activeTabIndex = 0;
        }
      }

      function canRefresh(data) {
        if (!!data && data.type === 'PersistentEvent') {
          // Refresh if the event id is set (non bulk) and the deleted event matches one of the events.
          if (data.id && vm.event.id) {
            return data.id === vm.event.id;
          }

          return filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
        }

        if (!!data && data.type === 'Stack') {
          return filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
        }

        return false;
      }

      function copied() {
        notificationService.success('Copied!');
      }

      function demoteTab(tabName) {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.promoteTab.success')
            .setProperty('id', _eventId)
            .setProperty('TabName', tabName)
            .submit();

          vm.project.promoted_tabs.splice(indexOf, 1);
          buildTabs('Extended Data');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.promoteTab.error')
            .setProperty('id', _eventId)
            .setProperty('response', response)
            .setProperty('TabName', tabName)
            .submit();

          notificationService.error('An error occurred promoting tab.');
        }

        var indexOf = vm.project.promoted_tabs.indexOf(tabName);
        if (indexOf < 0) {
          return;
        }

        $ExceptionlessClient.createFeatureUsage(source + '.demoteTab')
          .setProperty('id', _eventId)
          .setProperty('TabName', tabName)
          .submit();

        return projectService.demoteTab(vm.project.id, tabName).then(onSuccess, onFailure);
      }

      function getCurrentTab() {
        var tab = vm.tabs.filter(function(t) { return t.index === vm.activeTabIndex; })[0];
        return tab && tab.index > 0 ? tab.title : null;
      }

      function getDuration() {
        return vm.event.value || moment().diff(vm.event.date, 'seconds');
      }

      function getErrorType() {
        if (vm.event.data['@error']) {
          var type = errorService.getTargetInfoExceptionType(vm.event.data['@error']);
          if (type) {
            return type;
          }
        }

        if (vm.event.data['@simple_error']) {
          return vm.event.data['@simple_error'].type;
        }

        return 'Unknown';
      }

      function getEvent() {
        function optionsCallback(options) {
          if (options.filter) {
            options.filter += ' stack:current';
          } else {
            options.filter = 'stack:current';
          }

          return options;
        }

        function onSuccess(response) {
          vm.event = response.data.plain();
          vm.event_json = angular.toJson(vm.event);
          vm.sessionEvents.relativeTo = vm.event.date;

          var links = linkService.getLinks(response.headers('link'));
          vm.previous = links['previous'] ? links['previous'].split('/').pop() : null;
          vm.next = links['next'] ? links['next'].split('/').pop() : null;

          addHotKeys();
          buildReferences();

          return vm.event;
        }

        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The event "' + $stateParams.id + '" could not be found.');
        }

        if (!_eventId) {
          onFailure();
        }

        return eventService.getById(_eventId, {}, optionsCallback).then(onSuccess, onFailure);
      }

      function getMessage() {
        if (vm.event && vm.event.data && vm.event.data['@error']) {
          var message = errorService.getTargetInfoMessage(vm.event.data['@error']);
          if (message) {
            return message;
          }
        }

        return vm.event.message;
      }

      function getProject() {
        function onSuccess(response) {
          vm.project = response.data.plain();
          vm.project.promoted_tabs = vm.project.promoted_tabs || [];

          return vm.project;
        }

        function onFailure() {
          $state.go('app.dashboard');
        }

        if (!vm.event || !vm.event.project_id) {
          onFailure();
        }

        return projectService.getById(vm.event.project_id, true).then(onSuccess, onFailure);
      }

      function getLocation() {
        var location = vm.event.data ? vm.event.data['@location'] : null;
        if (!location) {
          return;
        }

        return [location.locality, location.level1, location.country]
          .filter(function(value) { return value && value.length; })
          .reduce(function(a, b, index) {
            a += (index > 0 ? ', ' : '') + b;
            return a;
          }, '');
      }

      function getRequestUrl() {
        var request = vm.event.data ? vm.event.data['@request'] : null;
        return request ? urlService.buildUrl(request.is_secure, request.host, request.port, request.path, request.query_string) : null;
      }

      function getVersion() {
        return vm.event.data['@version'];
      }

      function hasCookies() {
        return !!vm.event.data['@request'].cookies && Object.keys(vm.event.data['@request'].cookies).length > 0;
      }

      function hasEnvironmentInfo() {
        return vm.event.data && vm.event.data['@environment'];
      }

      function hasIdentity() {
        return vm.event.data && vm.event.data['@user'] && vm.event.data['@user'].identity;
      }

      function hasUserName() {
        return vm.event.data && vm.event.data['@user'] && vm.event.data['@user'].name;
      }

      function hasLevel() {
        return vm.event.data && vm.event.data['@level'];
      }

      function hasRequestInfo() {
        return vm.event.data && vm.event.data['@request'];
      }

      function hasUserEmail() {
        return vm.event.data && vm.event.data['@user_description'] && vm.event.data['@user_description'].email_address;
      }

      function hasUserDescription() {
        return vm.event.data && vm.event.data['@user_description'] && vm.event.data['@user_description'].description;
      }

      function hasTags() {
        return vm.event.tags && vm.event.tags.length > 0;
      }

      function hasVersion() {
        return vm.event.data && vm.event.data['@version'];
      }

      function isError() {
        return vm.event.type === 'error';
      }

      function isLevelSuccess() {
        var level = hasLevel() ? vm.event.data['@level'].toLowerCase() : null;
        return level === 'trace' || level === 'debug';
      }

      function isLevelInfo() {
        return hasLevel() && vm.event.data['@level'].toLowerCase() === 'info';
      }

      function isLevelWarning() {
        return hasLevel() && vm.event.data['@level'].toLowerCase() === 'warn';
      }

      function isLevelError() {
        return hasLevel() && vm.event.data['@level'].toLowerCase() === 'error';
      }

      function isPromoted(tabName) {
        if (!vm.project || !vm.project.promoted_tabs) {
          return false;
        }

        return vm.project.promoted_tabs.filter(function (tab) { return tab === tabName; }).length > 0;
      }

      function isSessionStart() {
        return vm.event.type === 'session';
      }

      function promoteTab(tabName) {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.promoteTab.success')
            .setProperty('id', _eventId)
            .setProperty('TabName', tabName)
            .submit();

          vm.project.promoted_tabs.push(tabName);
          buildTabs(tabName);
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.promoteTab.error')
            .setProperty('id', _eventId)
            .setProperty('response', response)
            .setProperty('TabName', tabName)
            .submit();

          notificationService.error('An error occurred promoting tab.');
        }

        $ExceptionlessClient.createFeatureUsage(source + '.promoteTab')
          .setProperty('id', _eventId)
          .setProperty('TabName', tabName)
          .submit();

        return projectService.promoteTab(vm.project.id, tabName).then(onSuccess, onFailure);
      }

      vm.activeTabIndex = 0;
      vm.canRefresh = canRefresh;
      vm.copied = copied;
      vm.demoteTab = demoteTab;
      vm.event = {};
      vm.event_json = '';
      vm.excludedAdditionalData = ['@browser', '@browser_version', '@browser_major_version', '@device', '@os', '@os_version', '@os_major_version', '@is_bot'];
      vm.getCurrentTab = getCurrentTab;
      vm.getDuration = getDuration;
      vm.getErrorType = getErrorType;
      vm.getEvent = getEvent;
      vm.getLocation = getLocation;
      vm.getMessage = getMessage;
      vm.getRequestUrl = getRequestUrl;
      vm.getVersion = getVersion;
      vm.hasCookies = hasCookies;
      vm.hasIdentity = hasIdentity;
      vm.hasUserName = hasUserName;
      vm.hasLevel = hasLevel;
      vm.hasRequestInfo = hasRequestInfo;
      vm.hasTags = hasTags;
      vm.hasUserDescription = hasUserDescription;
      vm.hasUserEmail = hasUserEmail;
      vm.hasVersion = hasVersion;
      vm.isError = isError;
      vm.isLevelSuccess = isLevelSuccess;
      vm.isLevelInfo = isLevelInfo;
      vm.isLevelWarning = isLevelWarning;
      vm.isLevelError = isLevelError;
      vm.isPromoted = isPromoted;
      vm.isSessionStart = isSessionStart;
      vm.project = {};
      vm.promoteTab = promoteTab;
      vm.references = [];
      vm.sessionEvents = {
        get: function (options) {
          function optionsCallback(options) {
            options.filter = '-type:heartbeat';
            options.time = null;
            return options;
          }

          return eventService.getBySessionId(vm.event.reference_id, options, optionsCallback);
        },
        options: {
          limit: 10,
          mode: 'summary'
        },
        source: source + '.Recent',
        timeHeaderText: 'Session Time',
        hideActions: true,
        hideSessionStartTime: true
      };
      vm.tabs = [];

      getEvent().then(getProject).then(function() { buildTabs($stateParams.tab); });
    }]);
}());
