(function () {
  'use strict';

  angular.module('app.project')
    .controller('project.Manage', function ($state, $stateParams, billingService, projectService, tokenService, webHookService, notificationService, dialogs, dialogService) {
      var vm = this;
      function addConfiguration() {
        return dialogs.create('app/project/manage/add-configuration-dialog.tpl.html', 'AddConfigurationDialog as vm', vm.config).result.then(saveClientConfiguration).catch(function(e){});
      }

      function addToken() {
        function onFailure() {
          notificationService.error('An error occurred while creating a new API key for your project.');
        }

        var options = {organization_id: vm.project.organization_id, project_id: vm._projectId};
        return tokenService.create(options).catch(onFailure);
      }

      function addWebHook() {
        return dialogs.create('components/web-hook/add-web-hook-dialog.tpl.html', 'AddWebHookDialog as vm').result.then(function (data) {
          data.project_id = vm._projectId;
          return createWebHook(data);
        }).catch(function(e){});
      }

      function createWebHook(data) {
        function onFailure(response) {
          if (response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message, vm.project.organization_id).then(function () {
              return createWebHook(data);
            }).catch(function(e){});
          }

          notificationService.error('An error occurred while saving the configuration setting.');
        }

        return webHookService.create(data).catch(onFailure);
      }

      function copied() {
        notificationService.success('Copied!');
      }

      function get(data) {
        if (vm._ignoreRefresh) {
          return;
        }

        if (data && data.type === 'Project' && data.deleted && data.id === vm._projectId) {
          $state.go('app.project.list');
          notificationService.error('The project "' + vm._projectId + '" was deleted.');
          return;
        }

        return getProject().then(getTokens).then(getConfiguration).then(getWebHooks).catch(function(e) {});
      }

      function getProject() {
        function onSuccess(response) {
          vm.common_methods = null;
          vm.user_namespaces = null;

          vm.project = response.data.plain();
          vm.hasPremiumFeatures = vm.project.has_premium_features;
          if (vm.project && vm.project.data) {
            vm.common_methods = vm.project.data['CommonMethods'];
            vm.user_namespaces = vm.project.data['UserNamespaces'];
          }

          return vm.project;
        }

        function onFailure() {
          $state.go('app.project.list');
          notificationService.error('The project "' + vm._projectId + '" could not be found.');
        }

        return projectService.getById(vm._projectId).then(onSuccess, onFailure);
      }

      function getTokens() {
        function onSuccess(response) {
          vm.tokens = response.data.plain();
          return vm.tokens;
        }

        function onFailure() {
          notificationService.error('An error occurred loading the api keys.');
        }

        return tokenService.getByProjectId(vm._projectId).then(onSuccess, onFailure);
      }

      function getConfiguration() {
        function onSuccess(response) {
          vm.config = [];
          vm.data_exclusions = null;
          vm.user_agents = null;

          angular.forEach(response.data.settings, function (value, key) {
            if (key === '@@DataExclusions') {
              vm.data_exclusions = value;
            } else if (key === '@@UserAgentBotPatterns') {
              vm.user_agents = value;
            } else {
              vm.config.push({key: key, value: value});
            }
          });

          return vm.config;
        }

        function onFailure() {
          notificationService.error('An error occurred loading the notification settings.');
        }

        return projectService.getConfig(vm._projectId).then(onSuccess, onFailure);
      }

      function getWebHooks() {
        function onSuccess(response) {
          vm.webHooks = response.data.plain();
          return vm.webHooks;
        }

        function onFailure() {
          notificationService.error('An error occurred loading the notification settings.');
        }

        return webHookService.getByProjectId(vm._projectId).then(onSuccess, onFailure);
      }

      function removeConfig(config) {
        return dialogService.confirmDanger('Are you sure you want to delete this configuration setting?', 'DELETE CONFIGURATION SETTING').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while trying to delete the configuration setting.');
          }

          return projectService.removeConfig(vm._projectId, config.key).catch(onFailure);
        }).catch(function(e){});
      }

      function removeProject() {
        return dialogService.confirmDanger('Are you sure you want to delete this project?', 'DELETE PROJECT').then(function () {
          function onSuccess() {
            notificationService.info('Successfully queued the project for deletion.');
            $state.go('app.project.list');
          }

          function onFailure() {
            notificationService.error('An error occurred while trying to delete the project.');
            vm._ignoreRefresh = false;
          }

          vm._ignoreRefresh = true;
          return projectService.remove(vm._projectId).then(onSuccess, onFailure);
        }).catch(function(e){});
      }

      function removeToken(token) {
        return dialogService.confirmDanger('Are you sure you want to delete this API key?', 'DELETE API KEY').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while trying to delete the API Key.');
          }

          return tokenService.remove(token.id).catch(onFailure);
        }).catch(function(e){});
      }

      function removeWebHook(hook) {
        return dialogService.confirmDanger('Are you sure you want to delete this web hook?', 'DELETE WEB HOOK').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while trying to delete the web hook.');
          }

          return webHookService.remove(hook.id).catch(onFailure);
        }).catch(function(e){});
      }

      function resetData() {
        return dialogService.confirmDanger('Are you sure you want to reset the data for this project?', 'RESET PROJECT DATA').then(function () {
          function onFailure() {
            notificationService.error('An error occurred while resetting project data.');
          }

          return projectService.resetData(vm._projectId).catch(onFailure);
        }).catch(function(e){});
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure() {
          notificationService.error('An error occurred while saving the project.');
        }

        return projectService.update(vm._projectId, vm.project).catch(onFailure);
      }

      function saveClientConfiguration(data) {
        function onFailure() {
          notificationService.error('An error occurred while saving the configuration setting.');
        }

        return projectService.setConfig(vm._projectId, data.key, data.value).catch(onFailure);
      }

      function saveCommonMethods() {
        function onFailure() {
          notificationService.error('An error occurred while saving the common methods.');
        }

        if (vm.common_methods) {
          return projectService.setData(vm._projectId, 'CommonMethods', vm.common_methods).catch(onFailure);
        } else {
          return projectService.removeData(vm._projectId, 'CommonMethods').catch(onFailure);
        }
      }

      function saveDataExclusion() {
        function onFailure() {
          notificationService.error('An error occurred while saving the the data exclusion.');
        }

        if (vm.data_exclusions) {
          return projectService.setConfig(vm._projectId, '@@DataExclusions', vm.data_exclusions).catch(onFailure);
        } else {
          return projectService.removeConfig(vm._projectId, '@@DataExclusions').catch(onFailure);
        }
      }

      function saveDeleteBotDataEnabled() {
        function onFailure() {
          notificationService.error('An error occurred while saving the project.');
        }

        return projectService.update(vm._projectId, {'delete_bot_data_enabled': vm.project.delete_bot_data_enabled}).catch(onFailure);
      }

      function saveUserAgents() {
        function onFailure() {
          notificationService.error('An error occurred while saving the user agents.');
        }

        if (vm.user_agents) {
          return projectService.setConfig(vm._projectId, '@@UserAgentBotPatterns', vm.user_agents).catch(onFailure);
        } else {
          return projectService.removeConfig(vm._projectId, '@@UserAgentBotPatterns').catch(onFailure);
        }
      }

      function saveUserNamespaces() {
        function onFailure() {
          notificationService.error('An error occurred while saving the user namespaces.');
        }

        if (vm.user_namespaces) {
          return projectService.setData(vm._projectId, 'UserNamespaces', vm.user_namespaces).catch(onFailure);
        } else {
          return projectService.removeData(vm._projectId, 'UserNamespaces').catch(onFailure);
        }
      }

      function showChangePlanDialog() {
        return billingService.changePlan(vm.project.organization_id).catch(function(e){});
      }

      function validateClientConfiguration(original, data) {
        if (original === data) {
          return false;
        }

        return !data ? 'Please enter a valid value.' : null;
      }

      this.$onInit = function $onInit() {
        vm._ignoreRefresh = false;
        vm._projectId = $stateParams.id;
        vm.addToken = addToken;
        vm.addConfiguration = addConfiguration;
        vm.addWebHook = addWebHook;
        vm.config = [];
        vm.copied = copied;
        vm.common_methods = null;
        vm.data_exclusions = null;
        vm.get = get;
        vm.getTokens = getTokens;
        vm.getWebHooks = getWebHooks;
        vm.hasPremiumFeatures = false;
        vm.project = {};
        vm.projectForm = {};
        vm.removeConfig = removeConfig;
        vm.removeProject = removeProject;
        vm.removeToken = removeToken;
        vm.removeWebHook = removeWebHook;
        vm.resetData = resetData;
        vm.save = save;
        vm.saveClientConfiguration = saveClientConfiguration;
        vm.saveCommonMethods = saveCommonMethods;
        vm.saveDataExclusion = saveDataExclusion;
        vm.saveDeleteBotDataEnabled = saveDeleteBotDataEnabled;
        vm.saveUserAgents = saveUserAgents;
        vm.saveUserNamespaces = saveUserNamespaces;
        vm.showChangePlanDialog = showChangePlanDialog;
        vm.tokens = [];
        vm.user_agents = null;
        vm.user_namespaces = null;
        vm.validateClientConfiguration = validateClientConfiguration;
        vm.webHooks = [];
        get();
      };
    });
}());
