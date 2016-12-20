(function () {
  'use strict';

  angular.module('app.event')
    .controller('Event', function ($ExceptionlessClient, $scope, $state, $stateParams, $timeout, billingService, clipboard, errorService, eventService, filterService, hotkeys, linkService, notificationService, projectService, urlService) {
      var source = 'app.event.Event';
      var _eventId = $stateParams.id;
      var _knownDataKeys = ['error', 'simple_error', 'request', 'environment', 'user', 'user_description', 'sessionend', 'session_id', 'version'];
      var vm = this;

      function activateTab(tabName) {
        for(var index = 0; index < vm.tabs.length; index++) {
          var tab = vm.tabs[index];
          if (tab.title !== tabName) {
            tab.active = false;
            continue;
          }

          tab.active = true;
          vm.activeTabIndex = tab.index;
          break;
        }

        if (vm.activeTabIndex < 0 || vm.activeTabIndex >= vm.tabs.length) {
          vm.tabs[0].active = true;
          vm.activeTabIndex = 0;
        }
      }

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

        if (vm.event.reference_id && vm.isSessionStart) {
          tabs.push({index: ++tabIndex, title: 'Session Events', template_key: 'session'});
        }

        if (vm.isError) {
          if (vm.event.data['@error']) {
            tabs.push({index: ++tabIndex, title: 'Exception', template_key: 'error'});
          } else if (vm.event.data['@simple_error']) {
            tabs.push({index: ++tabIndex, title: 'Exception', template_key: 'simple-error'});
          }
        }

        if (Object.keys(vm.request).length > 0) {
          tabs.push({index: ++tabIndex, title: vm.isSessionStart ? 'Browser' : 'Request', template_key: 'request'});
        }

        if (Object.keys(vm.environment).length > 0) {
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
        $timeout(function() { activateTab(tabNameToActivate); }, 1);
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

        if (!!data && data.type === 'Organization' || data.type === 'Project') {
          return filterService.includedInProjectOrOrganizationFilter({organizationId: data.id, projectId: data.id});
        }

        return !data;
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
        return tab && tab.index > 0 ? tab.title : 'Overview';
      }

      function getDuration() {
        // TODO: this binding expression can be optimized.
        return vm.event.value || moment().diff(vm.event.date, 'seconds');
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
          function getErrorType(event) {
            if (event.data && event.data['@error']) {
              var type = errorService.getTargetInfoExceptionType(event.data['@error']);
              if (type) {
                return type;
              }
            }

            if (event.data && event.data['@simple_error']) {
              return event.data['@simple_error'].type;
            }

            return 'Unknown';
          }

          function getLocation(event) {
            var location = event.data ? event.data['@location'] : null;
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

          function getMessage(event) {
            if (event.data && event.data['@error']) {
              var message = errorService.getTargetInfoMessage(event.data['@error']);
              if (message) {
                return message;
              }
            }

            return event.message;
          }

          vm.event = response.data.plain();
          vm.event_json = angular.toJson(vm.event);
          vm.sessionEvents.relativeTo = vm.event.date;
          vm.errorType = getErrorType(vm.event);
          vm.environment = vm.event.data['@environment'];
          vm.location = getLocation(vm.event);
          vm.message = getMessage(vm.event);
          vm.isError = vm.event.type === 'error';
          vm.isSessionStart = vm.event.type === 'session';
          vm.level = event.data && !!vm.event.data['@level'] ? vm.event.data['@level'].toLowerCase() : null;
          vm.isLevelSuccess = vm.level === 'trace' || vm.level === 'debug';
          vm.isLevelInfo = vm.level === 'info';
          vm.isLevelWarning = vm.level === 'warn';
          vm.isLevelError = vm.level === 'error';

          vm.request = event.data && vm.event.data['@request'];
          vm.hasCookies = vm.request && !!vm.request.cookies && Object.keys(vm.request.cookies).length > 0;
          vm.requestUrl = vm.request && urlService.buildUrl(vm.request.is_secure, vm.request.host, vm.request.port, vm.request.path, vm.request.query_string);

          vm.user = event.data && vm.event.data['@user'];
          vm.userIdentity = vm.user && vm.user.identity;
          vm.userName = vm.user && vm.user.name;

          vm.userDescription = event.data && vm.event.data['@user_description'];
          vm.userEmail = vm.userDescription && vm.userDescription.email_address;
          vm.userDescription = vm.userDescription && vm.userDescription.description;
          vm.version = event.data && vm.event.data['@version'];

          var links = linkService.getLinks(response.headers('link'));
          vm.previous = links['previous'] ? links['previous'].split('/').pop() : null;
          vm.next = links['next'] ? links['next'].split('/').pop() : null;

          addHotKeys();
          buildReferences();

          return vm.event;
        }

        function onFailure(response) {
          if (response && response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message).then(function () {
              return getEvent();
            }, function () {
                $state.go('app.dashboard');
              }
            );
          }

          $state.go('app.dashboard');
          notificationService.error('The event "' + $stateParams.id + '" could not be found.');
        }

        if (!_eventId) {
          onFailure();
        }

        return eventService.getById(_eventId, {}, optionsCallback).then(onSuccess, onFailure).catch(function (e) {});
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

      function isPromoted(tabName) {
        if (!vm.project || !vm.project.promoted_tabs) {
          return false;
        }

        return vm.project.promoted_tabs.filter(function (tab) { return tab === tabName; }).length > 0;
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

      this.$onInit = function $onInit() {
        vm.activeTabIndex = -1;
        vm.activateTab = activateTab;
        vm.canRefresh = canRefresh;
        vm.copied = copied;
        vm.demoteTab = demoteTab;
        vm.event = {};
        vm.event_json = '';
        vm.excludedAdditionalData = ['@browser', '@browser_version', '@browser_major_version', '@device', '@os', '@os_version', '@os_major_version', '@is_bot'];
        vm.getCurrentTab = getCurrentTab;
        vm.getDuration = getDuration;
        vm.errorType = 'Unknown';
        vm.environment = {};
        vm.location = '';
        vm.message = '';
        vm.isError = false;
        vm.isSessionStart = false;
        vm.level = '';
        vm.isLevelSuccess = false;
        vm.isLevelInfo = false;
        vm.isLevelWarning = false;
        vm.isLevelError = false;
        vm.isPromoted = isPromoted;
        vm.request = {};
        vm.requestUrl = '';
        vm.hasCookies = false;
        vm.user = {};
        vm.userIdentity = '';
        vm.userName = '';
        vm.userDescription = {};
        vm.userEmail = '';
        vm.userDescription = '';
        vm.version = '';
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

        getEvent().then(getProject).then(function () {
          buildTabs($stateParams.tab);
        });
      };
    });
}());
