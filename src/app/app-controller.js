(function () {
  'use strict';

  angular.module('app')
    .controller('App', ['$scope', '$state', '$stateParams', '$window', 'authService', 'billingService', 'filterService', 'hotkeys', 'INTERCOM_APPID', '$intercom', 'notificationService', 'organizationService', 'signalRService', 'stateService', 'STRIPE_PUBLISHABLE_KEY', 'urlService', 'userService', 'VERSION', function ($scope, $state, $stateParams, $window, authService, billingService, filterService, hotkeys, INTERCOM_APPID, $intercom, notificationService, organizationService, signalRService, stateService, STRIPE_PUBLISHABLE_KEY, urlService, userService, VERSION) {
      var vm = this;

      function canChangePlan() {
        return STRIPE_PUBLISHABLE_KEY && vm.organizations && vm.organizations.length > 0;
      }

      function changePlan(organizationId) {
        return billingService.changePlan(organizationId);
      }

      function getDashboardUrl(type) {
        return urlService.buildFilterUrl({ route: 'dashboard', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getRecentUrl(type) {
        return urlService.buildFilterUrl({ route: 'recent', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getFrequentUrl(type) {
        return urlService.buildFilterUrl({ route: 'frequent', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getNewUrl(type) {
        return urlService.buildFilterUrl({ route: 'new', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getOrganizations() {
        function onSuccess(response) {
          vm.organizations = response.data.plain();
          return response;
        }

        return organizationService.getAll().then(onSuccess);
      }

      function getUser(data) {
        function onSuccess(response) {
          vm.user = response.data.plain();
          return response;
        }

        if (data && data.type === 'User' && data.deleted && data.id === vm.user.id) {
          notificationService.error('Your user account was deleted. Please create a new account.');
          return authService.logout(true);
        }

        return userService.getCurrentUser().then(onSuccess);
      }

      function hasAdminRole() {
        return userService.hasAdminRole(vm.user);
      }

      function isAllMenuActive() {
        return $state.includes('app.dashboard', $stateParams) ||
          $state.includes('app.project-dashboard', $stateParams) ||
          $state.includes('app.organization-dashboard', $stateParams) ||
          $state.includes('app.frequent', $stateParams) ||
          $state.includes('app.project-frequent', $stateParams) ||
          $state.includes('app.organization-frequent', $stateParams) ||
          $state.includes('app.new', $stateParams) ||
          $state.includes('app.project-new', $stateParams) ||
          $state.includes('app.organization-new', $stateParams) ||
          $state.includes('app.recent', $stateParams) ||
          $state.includes('app.project-recent', $stateParams) ||
          $state.includes('app.organization-recent', $stateParams);
      }

      function isAdminMenuActive() {
        return $state.includes('app.project.list', $stateParams) ||
          $state.includes('app.organization.list', $stateParams) ||
          $state.includes('app.account.manage', $stateParams) ||
          $state.includes('app.admin.dashboard', $stateParams);
      }

      function isIntercomEnabled() {
        return authService.isAuthenticated() && INTERCOM_APPID;
      }

      function isSmartDevice($window) {
        var ua = $window.navigator.userAgent || $window.navigator.vendor || $window.opera;
        return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

      function isTypeMenuActive(type) {
        var params = angular.extend({}, $stateParams, { type: type });

        return $state.includes('app.type-dashboard', params) ||
          $state.includes('app.project-type-dashboard', params) ||
          $state.includes('app.organization-type-dashboard', params) ||
          $state.includes('app.type-frequent', params) ||
          $state.includes('app.project-type-frequent', params) ||
          $state.includes('app.organization-type-frequent', params) ||
          $state.includes('app.type-new', params) ||
          $state.includes('app.project-type-new', params) ||
          $state.includes('app.organization-type-new', params) ||
          $state.includes('app.type-recent', params) ||
          $state.includes('app.project-type-recent', params) ||
          $state.includes('app.organization-type-recent', params);
      }

      function startSignalR() {
        return signalRService.startDelayed(1000);
      }

      if (!authService.isAuthenticated()) {
        stateService.save(['auth.']);
        return $state.go('auth.login');
      }

      if (!!navigator.userAgent.match(/MSIE/i)) {
        angular.element($window.document.body).addClass('ie');
      }

      if (isSmartDevice($window)) {
        angular.element($window.document.body).addClass('smart');
      }

      function showIntercom() {
        $intercom('showNewMessage');
      }

      hotkeys.bindTo($scope)
        .add({
          combo: 'f1',
          description: 'Documentation',
          callback: function openDocumention() {
            $window.open('http://docs.exceptionless.com', '_blank');
          }
        });

      $scope.$on('$destroy', signalRService.stop);

      vm.canChangePlan = canChangePlan;
      vm.changePlan = changePlan;
      vm.getDashboardUrl = getDashboardUrl;
      vm.getRecentUrl = getRecentUrl;
      vm.getFrequentUrl = getFrequentUrl;
      vm.getNewUrl = getNewUrl;
      vm.getOrganizations = getOrganizations;
      vm.getUser = getUser;
      vm.hasAdminRole = hasAdminRole;
      vm.isAllMenuActive = isAllMenuActive;
      vm.isAdminMenuActive = isAdminMenuActive;
      vm.isIntercomEnabled = isIntercomEnabled;
      vm.isTypeMenuActive = isTypeMenuActive;
      vm.organizations = [];
      vm.settings = {
        asideFolded: false
      };
      vm.showIntercom = showIntercom;
      vm.user = {};
      vm.version = VERSION;

      getUser().then(getOrganizations).then(startSignalR);
    }]);
}());
