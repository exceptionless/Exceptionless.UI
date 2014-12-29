(function () {
  'use strict';

  angular.module('exceptionless.organization-notifications', [
    'angular-intercom',
    'app.config',

    'exceptionless.billing',
    'exceptionless.filter',
    'exceptionless.notification',
    'exceptionless.organization',
    'exceptionless.project',
    'exceptionless.refresh'
  ])
  .directive('organizationNotifications', [function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        organizationId: '=',
        ignoreFree: '=',
        ignoreConfigureProjects: '='
      },
      templateUrl: "components/organization-notifications/organization-notifications-directive.tpl.html",
      controller: ['$scope', 'billingService', 'filterService', 'INTERCOM_APPID', '$intercom', 'notificationService', 'organizationService', 'projectService', 'STRIPE_PUBLISHABLE_KEY', function($scope, billingService, filterService, INTERCOM_APPID, $intercom, notificationService, organizationService, projectService, STRIPE_PUBLISHABLE_KEY) {
        var vm = this;

        function get() {
          return getOrganizations().then(getProjects).then(getOrganizationNotifications);
        }

        function getCurrentOrganizationId() {
          function getOrganizationFromProjectFilter() {
            if (!vm.projects || !filterService.getProjectId()) {
              return null;
            }

            var project = vm.projects.filter(function(o) { return o.id === filterService.getProjectId(); })[0];
            return project ? project.organization_id : null;
          }

          return $scope.organizationId || filterService.getOrganizationId() || getOrganizationFromProjectFilter();
        }

        function getCurrentProjects() {
          var projects = [];
          angular.forEach(vm.projects, function(project) {
            if (filterService.getProjectId()) {
              if (project.id === filterService.getProjectId()) {
                projects.push(project);
              }

              return;
            }

            if (filterService.getOrganizationId()) {
              if (project.organization_id === filterService.getOrganizationId()) {
                projects.push(project);
              }
            } else {
              projects.push(project);
            }
          });

          return projects;
        }

        function getOrganizationNotifications() {
          vm.freeOrganizations = [];
          vm.hourlyOverageOrganizations = [];
          vm.monthlyOverageOrganizations = [];
          vm.projectsRequiringConfiguration = [];
          vm.organizationsWithNoProjects = [];
          vm.suspendedForBillingOrganizations = [];
          vm.suspendedForAbuseOrOverageOrNotActiveOrganizations = [];
          vm.suspendedOrganizations = [];

          var currentOrganizationId = getCurrentOrganizationId();
          var currentProjects = getCurrentProjects();
          angular.forEach(vm.organizations, function(organization) {
            if (currentOrganizationId && organization.id !== currentOrganizationId) {
              return;
            }

            if (organization.is_suspended === true) {
              vm.suspendedOrganizations.push(organization);

              if (organization.suspension_code === 'Billing') {
                vm.suspendedForBillingOrganizations.push(organization);
              } else if (organization.billing_status !== 1 || organization.suspension_code === 'Abuse' || organization.suspension_code === 'Overage') {
                vm.suspendedForAbuseOrOverageOrNotActiveOrganizations.push(organization);
              }
            }

            if (organization.is_over_monthly_limit === true) {
              vm.monthlyOverageOrganizations.push(organization);
              return;
            }

            if (organization.is_over_hourly_limit === true) {
              vm.hourlyOverageOrganizations.push(organization);
              return;
            }

            // Only show when there are no projects in the current selected organizations.
            if (currentProjects.length === 0) {
              vm.organizationsWithNoProjects.push(organization);
            }

            // Only show it if you absolutely have no data or the current project has no data or if the current org has no data.
            var canShowConfigurationAlert = currentProjects.filter(function(p) { return p.total_event_count === 0; }).length === currentProjects.length;

            if (!$scope.ignoreConfigureProjects && canShowConfigurationAlert) {
              var hasProjectsRequiringConfiguration = false;
              angular.forEach(currentProjects, function (project) {
                if (project.organization_id !== organization.id) {
                  return;
                }

                if (project.total_event_count === 0) {
                  vm.projectsRequiringConfiguration.push(project);
                  hasProjectsRequiringConfiguration = true;
                }
              });

              if (hasProjectsRequiringConfiguration) {
                return;
              }
            }

            if (!$scope.ignoreFree && organization.plan_id === 'EX_FREE') {
              vm.freeOrganizations.push(organization);
            }
          });

          vm.hasNotifications = true;
        }

        function getOrganizations() {
          function getSelectedOrganization() {
            function onSuccess(response) {
              vm.organizations.push(response.data.plain());
              return vm.organizations;
            }

            var organizationId = getCurrentOrganizationId();
            if (!organizationId || vm.organizations.filter(function(o) { return o.id === organizationId; })[0])
              return;

            return organizationService.getById(organizationId).then(onSuccess);
          }

          function getAllOrganizations() {
            function onSuccess(response) {
              angular.forEach(response.data.plain(), function(value, key) {
                vm.organizations.push(value);
              });

              return vm.organizations;
            }

            return  organizationService.getAll().then(onSuccess);
          }

          vm.organizations = [];
          return getAllOrganizations().then(getSelectedOrganization);
        }

        function getProjects() {
          function onSuccess(response) {
            vm.projects = response.data.plain();
            return vm.projects;
          }

          return projectService.getAll().then(onSuccess);
        }

        function hasFreeOrganizations() {
          return vm.freeOrganizations && vm.freeOrganizations.length > 0;
        }

        function hasHourlyOverageOrganizations() {
          return vm.hourlyOverageOrganizations && vm.hourlyOverageOrganizations.length > 0;
        }

        function hasMonthlyOverageOrganizations() {
          return vm.monthlyOverageOrganizations && vm.monthlyOverageOrganizations.length > 0;
        }

        function hasProjectsRequiringConfiguration() {
          return vm.projectsRequiringConfiguration && vm.projectsRequiringConfiguration.length > 0;
        }

        function hasOrganizations() {
          return vm.organizations && vm.organizations.length > 0;
        }

        function hasOrganizationsWithNoProjects() {
          return vm.organizationsWithNoProjects && vm.organizationsWithNoProjects.length > 0;
        }

        function hasSuspendedForBillingOrganizations() {
          return vm.suspendedForBillingOrganizations && vm.suspendedForBillingOrganizations.length > 0;
        }

        function hasSuspendedForAbuseOrOverageOrNotActiveOrganizations() {
          return vm.suspendedForAbuseOrOverageOrNotActiveOrganizations && vm.suspendedForAbuseOrOverageOrNotActiveOrganizations.length > 0;
        }

        function hasSuspendedOrganizations() {
          return vm.suspendedOrganizations && vm.suspendedOrganizations.length > 0;
        }

        function isIntercomEnabled() {
          return INTERCOM_APPID;
        }

        function showChangePlanDialog(organizationId) {
          if (!STRIPE_PUBLISHABLE_KEY) {
            notificationService.error('Billing is currently disabled.');
            return;
          }

          organizationId = organizationId || getCurrentOrganizationId();
          if (!organizationId && hasSuspendedOrganizations()) {
            organizationId = vm.suspendedOrganizations[0].id;
          }

          if (!organizationId && hasMonthlyOverageOrganizations()) {
            organizationId = vm.monthlyOverageOrganizations[0].id;
          }

          if (!organizationId && hasHourlyOverageOrganizations()) {
            organizationId = vm.hourlyOverageOrganizations[0].id;
          }

          if (!organizationId && hasFreeOrganizations()) {
            organizationId = vm.freeOrganizations[0].id;
          }

          return billingService.changePlan(organizationId);
        }

        function showIntercom() {
          $intercom.show();
        }

        vm.freeOrganizations = [];
        vm.get = get;
        vm.getOrganizationNotifications = getOrganizationNotifications;
        vm.hasFreeOrganizations = hasFreeOrganizations;
        vm.hasHourlyOverageOrganizations = hasHourlyOverageOrganizations;
        vm.hasMonthlyOverageOrganizations = hasMonthlyOverageOrganizations;
        vm.hasNotifications = false;
        vm.hasProjectsRequiringConfiguration = hasProjectsRequiringConfiguration;
        vm.hasOrganizations = hasOrganizations;
        vm.hasOrganizationsWithNoProjects = hasOrganizationsWithNoProjects;
        vm.hasSuspendedForBillingOrganizations = hasSuspendedForBillingOrganizations;
        vm.hasSuspendedForAbuseOrOverageOrNotActiveOrganizations = hasSuspendedForAbuseOrOverageOrNotActiveOrganizations;
        vm.hasSuspendedOrganizations = hasSuspendedOrganizations;
        vm.isIntercomEnabled = isIntercomEnabled;
        vm.organizations = [];
        vm.organizationsWithNoProjects = [];
        vm.hourlyOverageOrganizations = [];
        vm.monthlyOverageOrganizations = [];
        vm.projects = [];
        vm.projectsRequiringConfiguration = [];
        vm.showChangePlanDialog = showChangePlanDialog;
        vm.showIntercom = showIntercom;
        vm.suspendedForBillingOrganizations = [];
        vm.suspendedForAbuseOrOverageOrNotActiveOrganizations = [];
        vm.suspendedOrganizations = [];

        get();
      }],
      controllerAs: 'vm'
    };
  }]);
}());

