(function () {
  'use strict';

  angular.module('app')
    .controller('App', ['$scope', '$state', '$stateParams', '$window', 'authService', 'filterService', 'hotkeys', 'signalRService', 'urlService', 'userService', 'VERSION', function ($scope, $state, $stateParams, $window, authService, filterService, hotkeys, signalRService, urlService, userService, VERSION) {
      var vm = this;

      function isSmartDevice($window) {
        var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
        return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

      function getDashboardUrl(type){
        return urlService.buildFilterUrl({ route: 'dashboard', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getRecentUrl(type){
        return urlService.buildFilterUrl({ route: 'recent', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getFrequentUrl(type){
        return urlService.buildFilterUrl({ route: 'frequent', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getNewUrl(type){
        return urlService.buildFilterUrl({ route: 'new', projectId: filterService.getProjectId(), organizationId: filterService.getOrganizationId(),  type: type });
      }

      function getUser() {
        function onSuccess(response) {
          vm.user = response.data.plain();
          return response;
        }

        return userService.getCurrentUser().then(onSuccess);
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
        return $state.go('auth.login');
      }

      if (!!navigator.userAgent.match(/MSIE/i)) {
        angular.element($window.document.body).addClass('ie');
      }

      if (isSmartDevice($window)) {
        angular.element($window.document.body).addClass('smart');
      }

      hotkeys.bindTo($scope)
        .add({
          combo: 'f1',
          description: 'Documentation',
          callback: function() {
            $window.open('http://docs.exceptionless.com', '_blank');
          }
        });


      $scope.$on('$destroy', signalRService.stop);

      vm.getDashboardUrl = getDashboardUrl;
      vm.getRecentUrl = getRecentUrl;
      vm.getFrequentUrl = getFrequentUrl;
      vm.getNewUrl = getNewUrl;
      vm.getUser = getUser;
      vm.isAllMenuActive = isAllMenuActive;
      vm.isAdminMenuActive = isAdminMenuActive;
      vm.isTypeMenuActive = isTypeMenuActive;
      vm.settings = {
        asideFolded: false
      };
      vm.user = {};
      vm.version = VERSION;

      getUser().then(startSignalR);
    }]);
}());
