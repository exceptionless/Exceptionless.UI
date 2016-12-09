(function () {
  'use strict';

  angular.module('app')
    .controller('App', function ($rootScope, $scope, $state, $stateParams, $window, authService, billingService, $ExceptionlessClient, filterService, hotkeys, INTERCOM_APPID, $intercom, locker, notificationService, organizationService, signalRService, stateService, STRIPE_PUBLISHABLE_KEY, SYSTEM_NOTIFICATION_MESSAGE, urlService, userService) {
      var vm = this;
      function addHotkeys() {
        function logFeatureUsage(name) {
          $ExceptionlessClient.createFeatureUsage(vm._source + '.hotkeys' + name).addTags('hotkeys').submit();
        }

        if (isIntercomEnabled()) {
          hotkeys.bindTo($scope)
            .add({
              combo: 'c',
              description: 'Chat with Support',
              callback: function chatWithSupport() {
                logFeatureUsage('Support');
                showIntercom();
              }
            });
        }

        hotkeys.bindTo($scope)
          .add({
            combo: 'g w',
            description: 'Go to Documentation',
            callback: function goToDocumention() {
              logFeatureUsage('Documentation');
              $window.open('https://github.com/exceptionless/Exceptionless/wiki', '_blank');
            }
          })
          .add({
            combo: 's',
            description: 'Focus Search Bar',
            callback: function focusSearchBar(event) {
              event.preventDefault();

              logFeatureUsage('SearchBar');
              $('#search').focus().select();
            }
          })
          .add({
            combo: 'g a',
            description: 'Go to My Account',
            callback: function goToMyAccount() {
              logFeatureUsage('Account');
              $state.go('app.account.manage', { tab: 'general' });
            }
          })
          .add({
            combo: 'g n',
            description: 'Go to Notifications',
            callback: function goToNotifications() {
              logFeatureUsage('Notifications');
              $state.go('app.account.manage', { tab: 'notifications' });
            }
          })
          .add({
            combo: 'g d',
            description: 'Go to Dashboard',
            callback: function goToDashboard() {
              logFeatureUsage('Dashboard');
              $window.open(vm.dashboardUrl.all, '_self');
            }
          })
          .add({
            combo: 'g o',
            description: 'Go to Organizations',
            callback: function goToOrganizations() {
              logFeatureUsage('Organizations');
              $state.go('app.organization.list');
            }
          })
          .add({
            combo: 'g p',
            description: 'Go to Projects',
            callback: function goToProjects() {
              logFeatureUsage('Projects');
              $state.go('app.project.list');
            }
          })
          .add({
            combo: 'g+g',
            description: 'Go to GitHub project',
            callback: function goToGitHub() {
              logFeatureUsage('GitHub');
              $window.open('https://github.com/exceptionless/Exceptionless', '_blank');
            }
          })
          .add({
            combo: 'g s',
            description: 'Go to public slack channel',
            callback: function goToSlack() {
              logFeatureUsage('Slack');
              $window.open('http://slack.exceptionless.com', '_blank');
            }
          });
      }

      function buildMenus() {
        function getFilterUrl(route, type) {
          return urlService.buildFilterUrl({ route: route, projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
        }

        function buildUrls() {
          var result = {
            dashboard: {},
            sessionDashboard: urlService.buildFilterUrl({ route: 'dashboard', routePrefix: 'session', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId() }),
            recent: {},
            frequent: {},
            users: {},
            new: {}
          };

          [undefined, 'error', 'log', '404', 'usage'].forEach(function(type) {
            var key = !type ? 'all' : type;
            result.dashboard[key] = getFilterUrl('dashboard', type);
            result.recent[key] = getFilterUrl('recent', type);
            result.frequent[key] = getFilterUrl('frequent', type);
            result.users[key] = getFilterUrl('users', type);
            result.new[key] = getFilterUrl('new', type);
          });

          return result;
        }

        function isAllMenuActive(state, params) {
          return dashboards.filter(function(dashboard) {
            if (state.includes('app.' + dashboard, params) ||
              state.includes('app.project-' + dashboard, params) ||
              state.includes('app.organization-' + dashboard, params)) {
              return true;
            }

            return false;
          }).length > 0;
        }

        function isAdminMenuActive(state, params) {
          return state.includes('app.project.list', params) ||
            state.includes('app.organization.list', params) ||
            state.includes('app.account.manage', params) ||
            state.includes('app.admin.dashboard', params);
        }

        function isReportsMenuActive(state, params) {
          return state.includes('app.session-dashboard', params) ||
            state.includes('app.session-project-dashboard', params) ||
            state.includes('app.session-organization-dashboard', params);
        }

        function isTypeMenuActive(state, params, type) {
          var parameters = angular.extend({}, params, { type: type });
          return dashboards.filter(function(dashboard) {
            if (state.includes('app.type-' + dashboard, parameters) ||
              state.includes('app.project-type-' + dashboard, parameters) ||
              state.includes('app.organization-type-' + dashboard, parameters)) {
              return true;
            }

            return false;
          }).length > 0;
        }

        var dashboards = ['dashboard', 'frequent', 'new', 'recent', 'users'];
        vm.urls = buildUrls();
        vm.isMenuActive = {
          all: isAllMenuActive($state, $stateParams),
          error: isTypeMenuActive($state, $stateParams, 'error'),
          log: isTypeMenuActive($state, $stateParams, 'log'),
          '404': isTypeMenuActive($state, $stateParams, '404'),
          usage: isTypeMenuActive($state, $stateParams, 'usage'),
          admin: isAdminMenuActive($state, $stateParams),
          reports: isReportsMenuActive($state, $stateParams)
        };
      }

      function changePlan(organizationId) {
        if (!STRIPE_PUBLISHABLE_KEY) {
          notificationService.error('Billing is currently disabled.');
          return;
        }

        return billingService.changePlan(organizationId).catch(function(e){});
      }

      function getOrganizations() {
        function onSuccess(response) {
          vm.organizations = response.data.plain();
          vm.canChangePlan = !!STRIPE_PUBLISHABLE_KEY && vm.organizations.length > 0;
          return response;
        }

        return organizationService.getAll().then(onSuccess);
      }

      function getUser(data) {
        function onSuccess(response) {
          vm.user = response.data.plain();
          $ExceptionlessClient.config.setUserIdentity({ identity: vm.user.email_address, name: vm.user.full_name, data: { user: vm.user }});
          return response;
        }

        if (data && data.type === 'User' && data.deleted && data.id === vm.user.id) {
          notificationService.error('Your user account was deleted. Please create a new account.');
          return authService.logout(true);
        }

        return userService.getCurrentUser().then(onSuccess);
      }

      function isIntercomEnabled() {
        return authService.isAuthenticated() && INTERCOM_APPID;
      }

      function startSignalR() {
        return signalRService.startDelayed(1000);
      }

      function showIntercom() {
        if (!isIntercomEnabled()) {
          return;
        }

        $ExceptionlessClient.submitFeatureUsage(vm._source + '.showIntercom');
        $intercom.showNewMessage();
      }

      function toggleSideNavCollapsed() {
        vm.isSideNavCollapsed = !vm.isSideNavCollapsed;
        vm._store.put('sideNavCollapsed', vm.isSideNavCollapsed);
      }

      this.$onInit = function $onInit() {
        function isSmartDevice($window) {
          var ua = $window.navigator.userAgent || $window.navigator.vendor || $window.opera;
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        }

        if (!!navigator.userAgent.match(/MSIE/i)) {
          angular.element($window.document.body).addClass('ie');
        }

        if (isSmartDevice($window)) {
          angular.element($window.document.body).addClass('smart');
        }

        $rootScope.$on('$stateChangeSuccess', buildMenus);
        $scope.$on('$destroy', signalRService.stop);
        vm._source = 'app.App';
        vm._store = locker.driver('local').namespace('app');

        vm.canChangePlan = false;
        vm.changePlan = changePlan;
        vm.urls = {
          dashboard: {},
          sessionDashboard: '',
          recent: {},
          frequent: {},
          users: {},
          new: {}
        };
        vm.getOrganizations = getOrganizations;
        vm.getUser = getUser;
        vm.isMenuActive = {};
        vm.isIntercomEnabled = isIntercomEnabled;
        vm.isSideNavCollapsed = vm._store.get('sideNavCollapsed') === true;
        vm.organizations = [];
        vm.showIntercom = showIntercom;
        vm.systemNotificationMessage = SYSTEM_NOTIFICATION_MESSAGE;
        vm.toggleSideNavCollapsed = toggleSideNavCollapsed;
        vm.user = {};

        addHotkeys();
        buildMenus();
        getUser().then(getOrganizations).then(startSignalR);
      };
    });
}());
