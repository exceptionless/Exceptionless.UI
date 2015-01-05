(function () {
  'use strict';

  angular.module('app.project')
    .controller('project.Manage', ['$state', '$stateParams', 'billingService', 'projectService', 'tokenService', 'webHookService', 'notificationService', 'featureService', 'dialogs', 'dialogService', function ($state, $stateParams, billingService, projectService, tokenService, webHookService, notificationService, featureService, dialogs, dialogService) {
      var projectId = $stateParams.id;
      var vm = this;

      function addConfiguration() {
        return dialogs.create('app/project/manage/add-configuration-dialog.tpl.html', 'AddConfigurationDialog as vm').result.then(saveClientConfiguration);
      }

      function addToken() {
        function onSuccess(response) {
          vm.tokens.push(response.data.plain());
        }

        function onFailure() {
          notificationService.error('An error occurred while creating a new API key for your project.');
        }

        var options = {organization_id: vm.project.organization_id, project_id: projectId};
        return tokenService.create(options).then(onSuccess, onFailure);
      }

      function addWebHook() {
        return dialogs.create('components/web-hook/add-web-hook-dialog.tpl.html', 'AddWebHookDialog as vm').result.then(function (data) {
          data.organization_id = vm.project.organization_id;
          data.project_id = projectId;
          return createWebHook(data);
        });
      }

      function createWebHook(data) {
        function onSuccess(response) {
          vm.webHooks.push(response.data);
          return response.data.plain();
        }

        function onFailure(response) {
          if (response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message).then(function () {
              return createWebHook(data);
            });
          }

          notificationService.error('An error occurred while saving the configuration setting.');
        }

        return webHookService.create(data).then(onSuccess, onFailure);
      }

      function copied() {
        notificationService.success('Copied!');
      }

      function get(data) {
        if (data && data.type === 'Project' && data.deleted && data.id === projectId) {
          $state.go('app.project.list');
          notificationService.error('The project "' + projectId + '" was deleted.');
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
          notificationService.error('The project "' + projectId + '" could not be found.');
        }

        return projectService.getById(projectId).then(onSuccess, onFailure);
      }

      function getTokens() {
        function onSuccess(response) {
          vm.tokens = response.data.plain();
          return vm.tokens;
        }

        function onFailure() {
          notificationService.error('An error occurred loading the api keys.');
        }

        return tokenService.getByProjectId(projectId).then(onSuccess, onFailure);
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

        return projectService.getConfig(projectId).then(onSuccess, onFailure);
      }

      function getWebHooks() {
        function onSuccess(response) {
          vm.webHooks = response.data.plain();
          return vm.webHooks;
        }

        function onFailure() {
          notificationService.error('An error occurred loading the notification settings.');
        }

        return webHookService.getByProjectId(projectId).then(onSuccess, onFailure);
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
          function onSuccess() {
            vm.config.splice(vm.config.indexOf(config), 1);
          }

          function onFailure() {
            notificationService.error('An error occurred while trying to delete the configuration setting.');
          }

          return projectService.removeConfig(projectId, config.key).then(onSuccess, onFailure);
        });
      }

      function removeProject() {
        return dialogService.confirmDanger('Are you sure you want to delete the project?', 'DELETE PROJECT').then(function () {
          function onSuccess() {
            $state.go('app.project.list');
          }

          function onFailure() {
            notificationService.error('An error occurred while trying to delete the project.');
          }

          return projectService.remove(projectId).then(onSuccess, onFailure);
        });
      }

      function removeToken(token) {
        return dialogService.confirmDanger('Are you sure you want to delete the API key?', 'DELETE API KEY').then(function () {
          function onSuccess() {
            vm.tokens.splice(vm.tokens.indexOf(token), 1);
          }

          function onFailure() {
            notificationService.error('An error occurred while trying to delete the API Key.');
          }

          return tokenService.remove(token.id).then(onSuccess, onFailure);
        });
      }

      function removeWebHook(hook) {

      }

      function resetData() {
        return dialogService.confirmDanger('Are you sure you want to reset the data for this project?', 'RESET PROJECT DATA').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while resetting project data.');
          }

          return projectService.resetData(projectId).catch(onFailure);
        });
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure() {
          notificationService.error('An error occurred while saving the project.');
        }

        return projectService.update(projectId, vm.project).catch(onFailure);
      }

      function saveClientConfiguration(data) {
        function onSuccess() {
          var found = false;
          vm.config.forEach(function (conf) {
            if (conf.key === data.key) {
              found = true;
              conf.value = data.value;
            }
          });

          if (!found) {
            vm.config.push(data);
          }
        }

        function onFailure() {
          notificationService.error('An error occurred while saving the configuration setting.');
        }

        return projectService.setConfig(projectId, data.key, data.value).then(onSuccess, onFailure);
      }

      function saveDataExclusion() {
        function onFailure() {
          notificationService.error('An error occurred while saving the the data exclusion.');
        }

        if (vm.data_exclusions) {
          return projectService.setConfig(projectId, '@@DataExclusions', vm.data_exclusions).catch(onFailure);
        } else {
          return projectService.removeConfig(projectId, '@@DataExclusions').catch(onFailure);
        }
      }

      function saveDeleteBotDataEnabled() {
        function onFailure() {
          notificationService.error('An error occurred while saving the project.');
        }

        return projectService.update(projectId, {'delete_bot_data_enabled': vm.project.delete_bot_data_enabled}).catch(onFailure);
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
