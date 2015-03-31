(function () {
  'use strict';

  angular.module('app.project')
    .controller('project.Manage', ['$state', '$stateParams', 'billingService', 'projectService', 'tokenService', 'webHookService', 'notificationService', 'featureService', 'dialogs', 'dialogService', function ($state, $stateParams, billingService, projectService, tokenService, webHookService, notificationService, featureService, dialogs, dialogService) {
      var _ignoreRefresh = false;
      var _projectId = $stateParams.id;
      var vm = this;

      function addConfiguration() {
        return dialogs.create('app/project/manage/add-configuration-dialog.tpl.html', 'AddConfigurationDialog as vm', vm.config).result.then(saveClientConfiguration);
      }

      function addToken() {
        function onFailure() {
          notificationService.error('An error occurred while creating a new API key for your project.');
        }

        var options = {organization_id: vm.project.organization_id, project_id: _projectId};
        return tokenService.create(options).catch(onFailure);
      }

      function addWebHook() {
        return dialogs.create('components/web-hook/add-web-hook-dialog.tpl.html', 'AddWebHookDialog as vm').result.then(function (data) {
          data.project_id = _projectId;
          return createWebHook(data);
        });
      }

      function createWebHook(data) {
        function onFailure(response) {
          if (response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message).then(function () {
              return createWebHook(data);
            });
          }

          notificationService.error('An error occurred while saving the configuration setting.');
        }

        return webHookService.create(data).catch(onFailure);
      }

      function copied() {
        notificationService.success('Copied!');
      }

      function get(data) {
        if (_ignoreRefresh) {
          return;
        }

        if (data && data.type === 'Project' && data.deleted && data.id === _projectId) {
          $state.go('app.project.list');
          notificationService.error('The project "' + _projectId + '" was deleted.');
          return;
        }

        return getProject().then(getTokens).then(getConfiguration).then(getWebHooks);
      }

      function getProject() {
        function onSuccess(response) {
          vm.project = response.data.plain();
          return vm.project;
        }

        function onFailure() {
          $state.go('app.project.list');
          notificationService.error('The project "' + _projectId + '" could not be found.');
        }

        return projectService.getById(_projectId).then(onSuccess, onFailure);
      }

      function getTokens() {
        function onSuccess(response) {
          vm.tokens = response.data.plain();
          return vm.tokens;
        }

        function onFailure() {
          notificationService.error('An error occurred loading the api keys.');
        }

        return tokenService.getByProjectId(_projectId).then(onSuccess, onFailure);
      }

      function getConfiguration() {
        function onSuccess(response) {
          vm.config = [];
          vm.data_exclusions = null;

          angular.forEach(response.data.settings, function (value, key) {
            if (key === '@@DataExclusions') {
              vm.data_exclusions = value;
            } else {
              vm.config.push({key: key, value: value});
            }
          });

          return vm.config;
        }

        function onFailure() {
          notificationService.error('An error occurred loading the notification settings.');
        }

        return projectService.getConfig(_projectId).then(onSuccess, onFailure);
      }

      function getWebHooks() {
        function onSuccess(response) {
          vm.webHooks = response.data.plain();
          return vm.webHooks;
        }

        function onFailure() {
          notificationService.error('An error occurred loading the notification settings.');
        }

        return webHookService.getByProjectId(_projectId).then(onSuccess, onFailure);
      }

      function hasConfiguration() {
        return vm.config.length > 0;
      }

      function hasPremiumFeatures() {
        return featureService.hasPremium();
      }

      function hasTokens() {
        return vm.tokens.length > 0;
      }

      function hasWebHook() {
        return vm.webHooks.length > 0;
      }

      function removeConfig(config) {
        return dialogService.confirmDanger('Are you sure you want to delete this configuration setting?', 'DELETE CONFIGURATION SETTING').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while trying to delete the configuration setting.');
          }

          return projectService.removeConfig(_projectId, config.key).catch(onFailure);
        });
      }

      function removeProject() {
        return dialogService.confirmDanger('Are you sure you want to delete this project?', 'DELETE PROJECT').then(function () {
          function onSuccess() {
            $state.go('app.project.list');
          }

          function onFailure() {
            notificationService.error('An error occurred while trying to delete the project.');
            _ignoreRefresh = false;
          }

          _ignoreRefresh = true;
          return projectService.remove(_projectId).then(onSuccess, onFailure);
        });
      }

      function removeToken(token) {
        return dialogService.confirmDanger('Are you sure you want to delete this API key?', 'DELETE API KEY').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while trying to delete the API Key.');
          }

          return tokenService.remove(token.id).catch(onFailure);
        });
      }

      function removeWebHook(hook) {
        return dialogService.confirmDanger('Are you sure you want to delete this web hook?', 'DELETE WEB HOOK').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while trying to delete the web hook.');
          }

          return webHookService.remove(hook.id).catch(onFailure);
        });
      }

      function resetData() {
        return dialogService.confirmDanger('Are you sure you want to reset the data for this project?', 'RESET PROJECT DATA').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while resetting project data.');
          }

          return projectService.resetData(_projectId).catch(onFailure);
        });
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure() {
          notificationService.error('An error occurred while saving the project.');
        }

        return projectService.update(_projectId, vm.project).catch(onFailure);
      }

      function saveClientConfiguration(data) {
        function onFailure() {
          notificationService.error('An error occurred while saving the configuration setting.');
        }

        return projectService.setConfig(_projectId, data.key, data.value).catch(onFailure);
      }

      function saveDataExclusion() {
        function onFailure() {
          notificationService.error('An error occurred while saving the the data exclusion.');
        }

        if (vm.data_exclusions) {
          return projectService.setConfig(_projectId, '@@DataExclusions', vm.data_exclusions).catch(onFailure);
        } else {
          return projectService.removeConfig(_projectId, '@@DataExclusions').catch(onFailure);
        }
      }

      function saveDeleteBotDataEnabled() {
        function onFailure() {
          notificationService.error('An error occurred while saving the project.');
        }

        return projectService.update(_projectId, {'delete_bot_data_enabled': vm.project.delete_bot_data_enabled}).catch(onFailure);
      }

      function showChangePlanDialog() {
        return billingService.changePlan(vm.project.organization_id);
      }

      function validateClientConfiguration(original, data) {
        if (original === data) {
          return false;
        }

        return !data ? 'Please enter a valid value.' : null;
      }

      vm.addToken = addToken;
      vm.addConfiguration = addConfiguration;
      vm.addWebHook = addWebHook;
      vm.config = [];
      vm.copied = copied;
      vm.data_exclusions = null;
      vm.get = get;
      vm.getTokens = getTokens;
      vm.getWebHooks = getWebHooks;
      vm.hasConfiguration = hasConfiguration;
      vm.hasPremiumFeatures = hasPremiumFeatures;
      vm.hasTokens = hasTokens;
      vm.hasWebHook = hasWebHook;
      vm.project = {};
      vm.removeConfig = removeConfig;
      vm.removeProject = removeProject;
      vm.removeToken = removeToken;
      vm.removeWebHook = removeWebHook;
      vm.resetData = resetData;
      vm.save = save;
      vm.saveClientConfiguration = saveClientConfiguration;
      vm.saveDataExclusion = saveDataExclusion;
      vm.saveDeleteBotDataEnabled = saveDeleteBotDataEnabled;
      vm.showChangePlanDialog = showChangePlanDialog;
      vm.tokens = [];
      vm.validateClientConfiguration = validateClientConfiguration;
      vm.webHooks = [];
      get();
    }]);
}());
