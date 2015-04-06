(function () {
  'use strict';

  angular.module('app.account')
    .controller('account.Manage', ['$stateParams', '$timeout', 'authService', 'billingService', 'FACEBOOK_APPID', 'featureService', 'GOOGLE_APPID', 'GITHUB_APPID', 'LIVE_APPID', 'notificationService', 'projectService', 'userService', function ($stateParams, $timeout, authService, billingService, FACEBOOK_APPID, featureService, GOOGLE_APPID, GITHUB_APPID, LIVE_APPID, notificationService, projectService, userService) {
      var _canSaveEmailAddress = true;
      var vm = this;

      function activateTab(tabName) {
        vm.tabExternalActive = tabName === 'external';
        vm.tabNotificationsActive = tabName === 'notifications';
        vm.tabPasswordActive = tabName === 'password';
      }

      function authenticate(provider) {
        function onFailure(response) {
          var message = 'An error occurred while adding external login.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return authService.authenticate(provider).catch(onFailure);
      }

      function canRemoveOAuthAccount() {
        return hasLocalAccount() || (vm.user.o_auth_accounts && vm.user.o_auth_accounts.length > 1);
      }

      function changePassword(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          notificationService.info('You have successfully changed your password.');
          vm.password = {};
          vm.passwordForm.$setUntouched(true);
          vm.passwordForm.$setPristine(true);
        }

        function onFailure(response) {
          var message = 'An error occurred while trying to change your password.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return authService.changePassword(vm.password).then(onSuccess, onFailure);
      }

      function get(data) {
        if (data && data.type === 'User' && data.deleted && data.id === vm.user.id) {
          notificationService.error('Your user account was deleted. Please create a new account.');
          return authService.logout(true);
        }

        return getUser().then(getProjects).then(getEmailNotificationSettings);
      }

      function getEmailNotificationSettings() {
        function onSuccess(response) {
          vm.emailNotificationSettings = response.data.plain();
          return vm.emailNotificationSettings;
        }

        function onFailure() {
          notificationService.error('An error occurred while loading the notification settings.');
        }

        vm.emailNotificationSettings = null;
        if (!vm.currentProject.id) {
          return;
        }

        return projectService.getNotificationSettings(vm.currentProject.id, vm.user.id).then(onSuccess, onFailure);
      }

      function getProjects() {
        function onSuccess(response) {
          vm.projects = response.data.plain();

          var currentProjectId = vm.currentProject.id ? vm.currentProject.id : $stateParams.projectId;
          vm.currentProject = vm.projects.filter(function(p) { return p.id === currentProjectId; })[0];
          if (!vm.currentProject) {
            vm.currentProject = vm.projects.length > 0 ? vm.projects[0] : {};
          }

          return vm.projects;
        }

        function onFailure() {
          notificationService.error('An error occurred while loading the projects.');
        }

        return projectService.getAll().then(onSuccess, onFailure);
      }

      function getUser() {
        function onSuccess(response) {
          vm.user = response.data.plain();
          vm.user.o_auth_accounts = vm.user.o_auth_accounts || [];
          return vm.user;
        }

        function onFailure(response) {
          var message = 'An error occurred while loading your user profile.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.getCurrentUser().then(onSuccess, onFailure);
      }

      function hasEmailNotifications() {
        return vm.user.email_notifications_enabled && vm.emailNotificationSettings;
      }

      function hasLocalAccount() {
        return vm.user.has_local_account === true;
      }

      function hasOAuthAccounts() {
        return vm.user && vm.user.o_auth_accounts && vm.user.o_auth_accounts.length > 0;
      }

      function hasPremiumFeatures() {
        return featureService.hasPremium();
      }

      function hasProjects() {
        return vm.projects.length > 0;
      }

      function hasPremiumEmailNotifications() {
        return hasEmailNotifications() && hasPremiumFeatures();
      }

      function isExternalLoginEnabled(provider) {
        if (!provider) {
          return !!FACEBOOK_APPID || !!GITHUB_APPID || !!GOOGLE_APPID || !!LIVE_APPID;
        }

        switch (provider) {
          case 'facebook':
            return !!FACEBOOK_APPID;
          case 'github':
            return !!GITHUB_APPID;
          case 'google':
            return !!GOOGLE_APPID;
          case 'live':
            return !!LIVE_APPID;
          default:
            return false;
        }
      }

      function resendVerificationEmail() {
        function onFailure(response) {
          var message = 'An error occurred while sending your verification email.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.resendVerificationEmail(vm.user.id).catch(onFailure);
      }

      function saveEmailAddress() {
        function resetCanSaveEmailAddress() {
          _canSaveEmailAddress = true;
        }

        if (!vm.emailAddressForm || vm.emailAddressForm.$invalid) {
          resetCanSaveEmailAddress();
          return;
        }

        if (!vm.user.email_address || vm.emailAddressForm.$pending) {
          var timeout = $timeout(function() {
            $timeout.cancel(timeout);
            saveEmailAddress();
          }, 100);
          return;
        }

        if (_canSaveEmailAddress) {
          _canSaveEmailAddress = false;
        } else {
          return;
        }

        function onSuccess(response) {
          vm.user.is_email_address_verified = response.data.is_verified;
        }

        function onFailure(response) {
          var message = 'An error occurred while saving your email address.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.updateEmailAddress(vm.user.id, vm.user.email_address).then(onSuccess, onFailure).then(resetCanSaveEmailAddress, resetCanSaveEmailAddress);
      }

      function saveEmailNotificationSettings() {
        function onFailure(response) {
          var message = 'An error occurred while saving your notification settings.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return projectService.setNotificationSettings(vm.currentProject.id, vm.user.id, vm.emailNotificationSettings).catch(onFailure);
      }

      function saveEnableEmailNotification() {
        function onFailure(response) {
          var message = 'An error occurred while saving your email notification preferences.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.update(vm.user.id, { email_notifications_enabled: vm.user.email_notifications_enabled }).catch(onFailure);
      }

      function saveUser(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure(response) {
          var message = 'An error occurred while saving your full name.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.update(vm.user.id, vm.user).catch(onFailure);
      }

      function showChangePlanDialog() {
        return billingService.changePlan(vm.currentProject ? vm.currentProject.organization_id : null);
      }

      function unlink(account) {
        function onSuccess() {
          vm.user.o_auth_accounts.splice(vm.user.o_auth_accounts.indexOf(account), 1);
        }

        function onFailure(response) {
          var message = 'An error occurred while removing the external login.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return authService.unlink(account.provider, account.provider_user_id).then(onSuccess, onFailure);
      }

      vm.authenticate = authenticate;
      vm.canRemoveOAuthAccount = canRemoveOAuthAccount;
      vm.changePassword = changePassword;
      vm.currentProject = {};
      vm.emailAddressForm = {};
      vm.emailNotificationSettings = null;
      vm.getEmailNotificationSettings = getEmailNotificationSettings;
      vm.hasEmailNotifications = hasEmailNotifications;
      vm.hasLocalAccount = hasLocalAccount;
      vm.get = get;
      vm.hasOAuthAccounts = hasOAuthAccounts;
      vm.hasPremiumEmailNotifications = hasPremiumEmailNotifications;
      vm.hasPremiumFeatures = hasPremiumFeatures;
      vm.hasProjects = hasProjects;
      vm.isExternalLoginEnabled = isExternalLoginEnabled;
      vm.password = {};
      vm.passwordForm = {};
      vm.projects = [];
      vm.resendVerificationEmail = resendVerificationEmail;
      vm.saveEmailAddress = saveEmailAddress;
      vm.saveEmailNotificationSettings = saveEmailNotificationSettings;
      vm.saveEnableEmailNotification = saveEnableEmailNotification;
      vm.saveUser = saveUser;
      vm.showChangePlanDialog = showChangePlanDialog;
      vm.tabExternalActive = false;
      vm.tabNotificationsActive = false;
      vm.tabPasswordActive = false;
      vm.unlink = unlink;
      vm.user = {};

      activateTab($stateParams.tab);
      get();
    }]);
}());
