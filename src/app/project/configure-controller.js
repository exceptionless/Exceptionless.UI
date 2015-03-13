(function () {
  'use strict';

  angular.module('app.project')
    .controller('project.Configure', ['$rootScope', '$state', '$stateParams', 'notificationService', 'projectService', 'tokenService', function ($rootScope, $state, $stateParams, notificationService, projectService, tokenService) {
      var _projectId = $stateParams.id;
      var _canRedirect = $stateParams.redirect === 'true';

      function canRedirect(data) {
        return _canRedirect && !!data && data.project_id === _projectId;
      }

      function copied() {
        notificationService.success('Copied!');
      }

      function getDefaultApiKey() {
        function onSuccess(response) {
          vm.apiKey = response.data.id;
          return vm.apiKey;
        }

        function onFailure() {
          notificationService.error('An error occurred while getting the API key for your project.');
        }

        return tokenService.getProjectDefault(_projectId).then(onSuccess, onFailure);
      }

      function getProject() {
        function onSuccess(response) {
          vm.project = response.data.plain();
          return vm.project;
        }

        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The project "' + _projectId + '" could not be found.');
        }

        return projectService.getById(_projectId, true).then(onSuccess, onFailure);
      }

      function getProjectTypes() {
        return [
          { key: 'Exceptionless', name: 'Console and Service applications', config: 'app.config' },
          { key: 'Exceptionless.Portable', name: 'Portable Class Library' },
          { key: 'Exceptionless.Mvc', name: 'ASP.NET MVC', config: 'web.config' },
          { key: 'Exceptionless.WebApi', name: 'ASP.NET Web API', config: 'web.config' },
          { key: 'Exceptionless.Web', name: 'ASP.NET Web Forms', config: 'web.config' },
          { key: 'Exceptionless.Windows', name: 'Windows Forms', config: 'app.config' },
          { key: 'Exceptionless.Wpf', name: 'Windows Presentation Foundation (WPF)', config: 'app.config' },
          { key: 'Exceptionless.Nancy', name: 'Nancy', config: 'app.config' }
        ];
      }

      function navigateToDashboard() {
        $state.go('app.project-dashboard', { projectId: _projectId } );
      }

      var vm = this;
      vm.apiKey = null;
      vm.canRedirect = canRedirect;
      vm.copied = copied;
      vm.currentProjectType = {};
      vm.navigateToDashboard = navigateToDashboard;
      vm.project = {};
      vm.projectTypes = getProjectTypes();

      getDefaultApiKey().then(getProject);
    }]);
}());
