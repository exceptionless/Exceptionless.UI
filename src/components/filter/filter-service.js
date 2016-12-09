(function () {
  'use strict';

  angular.module('exceptionless.filter')
    .factory('filterService', function ($rootScope, filterStoreService, objectIDService) {
      var DEFAULT_TIME_FILTER = 'last week';
      var _time = filterStoreService.getTimeFilter() || DEFAULT_TIME_FILTER;
      var _eventType, _organizationId, _projectId, _raw;

      function apply(source) {
        return angular.extend({}, getDefaultOptions(), source);
      }

      function buildFilter() {
        var filters = [];

        if (_organizationId) {
          filters.push('organization:' + _organizationId);
        }

        if (_projectId) {
          filters.push('project:' + _projectId);
        }

        if (_eventType) {
          filters.push('type:' + _eventType);
        }

        var filter = _raw || '';
        if (!filter || filter.trim() !== '*') {
          var hasFixed = filter.search(/\bfixed:/i) !== -1;
          if (!hasFixed) {
            filters.push('fixed:false');
          }

          var hasHidden = filter.search(/\bhidden:/i) !== -1;
          if (!hasHidden) {
            filters.push('hidden:false');
          }

          if (filter) {
            filters.push('(' + filter + ')');
          }
        }

        return filters.join(' ').trim();
      }

      function clearFilter() {
        if (!_raw) {
          return;
        }

        setFilter(null, false);
        fireFilterChanged();
      }

      function clearOrganizationAndProjectFilter() {
        if (!_organizationId && !_projectId) {
          return;
        }

        _organizationId = _projectId = null;
        fireFilterChanged();
      }

      function fireFilterChanged() {
        var options = {
          organization_id: _organizationId,
          project_id: _projectId,
          type: _eventType
        };

        $rootScope.$emit('filterChanged', angular.extend(options, getDefaultOptions()));
      }

      function getDefaultOptions() {
        var options = { offset: getTimeZoneOffset() };

        var filter = buildFilter();
        if (filter) {
          angular.extend(options, { filter: filter });
        }

        if (!!_time && _time !== 'all') {
          angular.extend(options, { time: _time });
        }

        return options;
      }

      function getFilter() {
        return _raw;
      }

      function getProjectId() {
        return _projectId;
      }

      function getOrganizationId() {
        return _organizationId;
      }

      function getEventType() {
        return _eventType;
      }

      function getTime() {
        return _time || DEFAULT_TIME_FILTER;
      }

      function getTimeZoneOffset() {
        return new Date().getTimezoneOffset() * -1;
      }

      function hasFilter() {
        return _raw || (_time && _time !== 'all');
      }

      function includedInProjectOrOrganizationFilter(data) {
        if (!data.organizationId && !data.projectId) {
          return false;
        }

        // The all filter is set.
        if (!_organizationId && !_projectId) {
          return true;
        }

        return _organizationId === data.organizationId || _projectId === data.projectId;
      }

      function setEventType(eventType, suspendNotifications) {
        if (angular.equals(eventType, _eventType)) {
          return;
        }

        _eventType = eventType;

        if (!suspendNotifications) {
          fireFilterChanged();
        }
      }

      function setOrganizationId(id, suspendNotifications) {
        if (angular.equals(id, _organizationId) || (id && !objectIDService.isValid(id))) {
          return;
        }

        _organizationId = id;
        _projectId = null;

        if (!suspendNotifications) {
          fireFilterChanged();
        }
      }

      function setProjectId(id, suspendNotifications) {
        if (angular.equals(id, _projectId) || (id && !objectIDService.isValid(id))) {
          return;
        }

        _projectId = id;
        _organizationId = null;

        if (!suspendNotifications) {
          fireFilterChanged();
        }
      }

      function setTime(time, suspendNotifications) {
        if (angular.equals(time, _time)) {
          return;
        }

        _time = time || DEFAULT_TIME_FILTER;
        filterStoreService.setTimeFilter(_time);

        if (!suspendNotifications) {
          fireFilterChanged();
        }
      }

      function setFilter(raw, suspendNotifications) {
        if (angular.equals(raw, _raw)) {
          return;
        }

        _raw = raw;

        if (!suspendNotifications) {
          fireFilterChanged();
        }
      }

      $rootScope.$on('OrganizationChanged', function ($event, organizationChanged) {
        if (organizationChanged.id === getOrganizationId() &&  organizationChanged.deleted) {
          setOrganizationId();
        }
      });

      $rootScope.$on('ProjectChanged', function ($event, projectChanged) {
        if (projectChanged.id === getProjectId() &&  projectChanged.deleted) {
          setProjectId();
        }
      });

      var service = {
        apply: apply,
        clearFilter: clearFilter,
        clearOrganizationAndProjectFilter: clearOrganizationAndProjectFilter,
        getEventType: getEventType,
        getFilter: getFilter,
        getProjectId: getProjectId,
        getOrganizationId: getOrganizationId,
        getTime: getTime,
        hasFilter: hasFilter,
        includedInProjectOrOrganizationFilter: includedInProjectOrOrganizationFilter,
        setEventType: setEventType,
        setFilter: setFilter,
        setOrganizationId: setOrganizationId,
        setProjectId: setProjectId,
        setTime: setTime
      };

      return service;
    });
}());
