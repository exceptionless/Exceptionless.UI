/* global Rickshaw:false */
(function () {
  'use strict';

  angular.module('app.stack')
    .controller('Stack', ['$ExceptionlessClient', '$filter', '$state', '$stateParams', 'billingService', 'dialogs', 'dialogService', 'eventService', 'filterService', 'notificationService', 'projectService', 'stackService', 'statService', function ($ExceptionlessClient, $filter, $state, $stateParams, billingService, dialogs, dialogService, eventService, filterService, notificationService, projectService, stackService, statService) {
      var source = 'app.stack.Stack';
      var _stackId = $stateParams.id;
      var vm = this;

      function addReferenceLink() {
        $ExceptionlessClient.submitFeatureUsage(source + '.addReferenceLink');
        return dialogs.create('app/stack/add-reference-dialog.tpl.html', 'AddReferenceDialog as vm').result.then(function (url) {
          function onSuccess() {
            $ExceptionlessClient.createFeatureUsage(source + '.addReferenceLink.success').setProperty('url', url).submit();
            vm.stack.references.push(url);
          }

          function onFailure() {
            $ExceptionlessClient.createFeatureUsage(source + '.addReferenceLink.error').setProperty('url', url).submit();
            notificationService.error('An error occurred while adding the reference link.');
          }

          if (vm.stack.references.indexOf(url) < 0)
            return stackService.addLink(_stackId, url).then(onSuccess, onFailure);
        });
      }

      function executeAction() {
        var action = $stateParams.action;
        if (action === 'mark-fixed' && !isFixed()) {
          return updateIsFixed(true);
        }

        if (action === 'stop-notifications' && !notificationsDisabled()) {
          return updateNotifications(true);
        }
      }

      function get(data) {
        if (data && data.type === 'Stack' && data.id !== _stackId) {
          return;
        }

        if (data && data.type === 'Stack' && data.deleted) {
          $state.go('app.dashboard');
          notificationService.error('The stack "' + _stackId + '" was deleted.');
          return;
        }

        if (data && data.type === 'PersistentEvent') {
          if (!data.deleted || data.project_id !== vm.stack.project_id) {
            return;
          }

          return getStats();
        }

        return getStack().then(getStats).then(getProject);
      }

      function getProject() {
        function onSuccess(response) {
          vm.project = response.data.plain();
          return vm.project;
        }

        return projectService.getById(vm.stack.project_id, true).then(onSuccess);
      }

      function getStack() {
        function onSuccess(response) {
          vm.stack = response.data.plain();
          vm.stack.references = vm.stack.references || [];
        }

        function onFailure(response) {
          $state.go('app.dashboard');

          if (response.status === 404) {
            notificationService.error('The stack "' + _stackId + '" could not be found.');
          } else {
            notificationService.error('An error occurred while loading the stack "' + _stackId + '".');
          }
        }

        return stackService.getById(_stackId).then(onSuccess, onFailure);
      }

      function getStats() {
        function onSuccess(response) {
          vm.stats = response.data.plain();
          if (!vm.stats.timeline) {
            vm.stats.timeline = [];
          }

          vm.chart.options.series[0].data = vm.stats.timeline.map(function (item) {
            return {x: moment.utc(item.date).unix(), y: item.total, data: item};
          });
        }

        var options = {};
        return statService.getByStackId(_stackId, options).then(onSuccess);
      }

      function hasTags() {
        return vm.stack.tags && vm.stack.tags.length > 0;
      }

      function hasReference() {
        return vm.stack.references && vm.stack.references.length > 0;
      }

      function hasReferences() {
        return vm.stack.references && vm.stack.references.length > 1;
      }

      function isCritical() {
        return vm.stack.occurrences_are_critical === true;
      }

      function isFixed() {
        return !!vm.stack.date_fixed;
      }

      function isHidden() {
        return vm.stack.is_hidden === true;
      }

      function isRegressed() {
        return vm.stack.is_regressed === true;
      }

      function isValidDate(date) {
        var d = moment(date);
        return !!date && d.isValid() && d.year() > 1;
      }

      function notificationsDisabled() {
        return vm.stack.disable_notifications === true;
      }

      function promoteToExternal() {
        $ExceptionlessClient.createFeatureUsage(source + '.promoteToExternal').setProperty('id', _stackId).submit();
        if (vm.project && !vm.project.has_premium_features) {
          var message = 'Promote to External is a premium feature used to promote an error stack to an external system. Please upgrade your plan to enable this feature.';
          return billingService.confirmUpgradePlan(message, vm.stack.organization_id).then(function () {
            return promoteToExternal();
          });
        }

        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.promoteToExternal.success').setProperty('id', _stackId).submit();
          notificationService.success('Successfully promoted stack!');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.promoteToExternal.error').setProperty('id', _stackId).setProperty('response', response).submit();
          if (response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message, vm.stack.organization_id).then(function () {
              return promoteToExternal();
            });
          }

          if (response.status === 501) {
            return dialogService.confirm(response.data.message, 'Manage Integrations').then(function () {
              $state.go('app.project.manage', { id: vm.stack.project_id });
            });
          }

          notificationService.error('An error occurred while promoting this stack.');
        }

        return stackService.promote(_stackId).then(onSuccess, onFailure);
      }

      function removeReferenceLink(reference) {
        $ExceptionlessClient.createFeatureUsage(source + '.removeReferenceLink').setProperty('id', _stackId).submit();
        return dialogService.confirmDanger('Are you sure you want to delete this reference link?', 'DELETE REFERENCE LINK').then(function () {
          function onSuccess() {
            $ExceptionlessClient.createFeatureUsage(source + '.removeReferenceLink.success').setProperty('id', _stackId).submit();
          }

          function onFailure(response) {
            $ExceptionlessClient.createFeatureUsage(source + '.removeReferenceLink.error').setProperty('id', _stackId).setProperty('response', response).submit();
            notificationService.info('An error occurred while deleting the external reference link.');
          }

          return stackService.removeLink(_stackId, reference).then(onSuccess, onFailure);
        });
      }

      function remove() {
        $ExceptionlessClient.createFeatureUsage(source + '.remove').setProperty('id', _stackId).submit();
        var message = 'Are you sure you want to delete this stack?';
        return dialogService.confirmDanger(message, 'DELETE STACK').then(function () {
          function onSuccess() {
            notificationService.info('Successfully queued the stack for deletion.');
            $ExceptionlessClient.createFeatureUsage(source + '.remove.success').setProperty('id', _stackId).submit();
            $state.go('app.project-dashboard', { projectId: vm.stack.project_id });
          }

          function onFailure(response) {
            $ExceptionlessClient.createFeatureUsage(source + '.remove.error').setProperty('id', _stackId).setProperty('response', response).submit();
            notificationService.error('An error occurred while deleting this stack.');
          }

          return stackService.remove(_stackId).then(onSuccess, onFailure);
        });
      }

      function updateIsCritical() {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.updateIsCritical.success').setProperty('id', _stackId).submit();
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.updateIsCritical.error').setProperty('id', _stackId).setProperty('response', response).submit();
          notificationService.error('An error occurred while marking future occurrences as ' + (isCritical() ? 'not critical.' : 'critical.'));
        }

        $ExceptionlessClient.createFeatureUsage(source + '.updateIsCritical').setProperty('id', _stackId).submit();
        if (isCritical()) {
          return stackService.markNotCritical(_stackId).then(onSuccess, onFailure);
        }

        return stackService.markCritical(_stackId).catch(onSuccess, onFailure);
      }

      function updateIsFixed(showSuccessNotification) {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.updateIsFixed.success').setProperty('id', _stackId).submit();
          if (!showSuccessNotification) {
            return;
          }

          var action = isFixed() ? ' not' : '';
          notificationService.info('Successfully queued the stack to be marked as' + action + ' fixed.');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.updateIsFixed.error').setProperty('id', _stackId).setProperty('response', response).submit();
          var action = isFixed() ? ' not' : '';
          notificationService.error('An error occurred while marking this stack as' + action + ' fixed.');
        }

        $ExceptionlessClient.createFeatureUsage(source + '.updateIsFixed').setProperty('id', _stackId).submit();
        if (isFixed()) {
          return stackService.markNotFixed(_stackId).then(onSuccess, onFailure);
        }

        return stackService.markFixed(_stackId).then(onSuccess, onFailure);
      }

      function updateIsHidden() {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.updateIsHidden.success').setProperty('id', _stackId).submit();
          notificationService.info('Successfully queued the stack to be marked as ' + (isHidden() ? 'shown.' : 'hidden.'));
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.updateIsHidden.error').setProperty('id', _stackId).setProperty('response', response).submit();
          notificationService.error('An error occurred while marking this stack as ' + (isHidden() ? 'shown.' : 'hidden.'));
        }

        $ExceptionlessClient.createFeatureUsage(source + '.updateIsHidden').setProperty('id', _stackId).submit();
        if (isHidden()) {
          return stackService.markNotHidden(_stackId).then(onSuccess, onFailure);
        }

        return stackService.markHidden(_stackId).then(onSuccess, onFailure);
      }

      function updateNotifications(showSuccessNotification) {
        function onSuccess() {
          $ExceptionlessClient.createFeatureUsage(source + '.updateNotifications.success').setProperty('id', _stackId).submit();
          if (!showSuccessNotification) {
            return;
          }

          var action = notificationsDisabled() ? 'enabled' : 'disabled';
          notificationService.info('Successfully ' + action + ' stack notifications.');
        }

        function onFailure(response) {
          $ExceptionlessClient.createFeatureUsage(source + '.updateNotifications.error').setProperty('id', _stackId).setProperty('response', response).submit();
          var action = notificationsDisabled() ? 'enabling' : 'disabling';
          notificationService.error('An error occurred while ' + action + ' stack notifications.');
        }

        $ExceptionlessClient.createFeatureUsage(source + '.updateNotifications').setProperty('id', _stackId).submit();
        if (notificationsDisabled()) {
          return stackService.enableNotifications(_stackId).then(onSuccess, onFailure);
        }

        return stackService.disableNotifications(_stackId).then(onSuccess, onFailure);
      }

      vm.addReferenceLink = addReferenceLink;

      vm.chart = {
        options: {
          padding: { top: 0.085 },
          renderer: 'stack',
          series: [{
            name: 'Occurrences',
            color: 'rgba(124, 194, 49, .9)',
            stroke: 'rgba(0, 0, 0, 0.15)'
          }],
          stroke: true,
          unstack: true
        },
        features: {
          hover: {
            render: function (args) {
              var date = moment.unix(args.domainX);
              var formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format('ddd, MMM D, YYYY') : date.format('ddd, MMM D, YYYY h:mma');
              var content = '<div class="date">' + formattedDate + '</div>';
              args.detail.sort(function (a, b) {
                return a.order - b.order;
              }).forEach(function (d) {
                var swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                content += swatch + $filter('number')(d.formattedYValue) + ' ' + d.series.name + ' <br />';
              }, this);

              var xLabel = document.createElement('div');
              xLabel.className = 'x_label';
              xLabel.innerHTML = content;
              this.element.appendChild(xLabel);

              // If left-alignment results in any error, try right-alignment.
              var leftAlignError = this._calcLayoutError([xLabel]);
              if (leftAlignError > 0) {
                xLabel.classList.remove('left');
                xLabel.classList.add('right');

                // If right-alignment is worse than left alignment, switch back.
                var rightAlignError = this._calcLayoutError([xLabel]);
                if (rightAlignError > leftAlignError) {
                  xLabel.classList.remove('right');
                  xLabel.classList.add('left');
                }
              }

              this.show();
            }
          },
          range: {
            onSelection: function (position) {
              var start = moment.unix(position.coordMinX).utc().local();
              var end = moment.unix(position.coordMaxX).utc().local();

              filterService.setTime(start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end.format('YYYY-MM-DDTHH:mm:ss'));
              $ExceptionlessClient.createFeatureUsage(source + '.chart.range.onSelection')
                .setProperty('id', _stackId)
                .setProperty('start', start)
                .setProperty('end', end)
                .submit();

              return false;
            }
          },
          xAxis: {
            timeFixture: new Rickshaw.Fixtures.Time.Local(),
            overrideTimeFixtureCustomFormatters: true
          },
          yAxis: {
            ticks: 5,
            tickFormat: 'formatKMBT',
            ticksTreatment: 'glow'
          }
        }
      };

      vm.get = get;
      vm.hasTags = hasTags;
      vm.hasReference = hasReference;
      vm.hasReferences = hasReferences;
      vm.isCritical = isCritical;
      vm.isFixed = isFixed;
      vm.isHidden = isHidden;
      vm.isRegressed = isRegressed;
      vm.isValidDate = isValidDate;
      vm.notificationsDisabled = notificationsDisabled;
      vm.promoteToExternal = promoteToExternal;
      vm.project = {};
      vm.remove = remove;
      vm.removeReferenceLink = removeReferenceLink;
      vm.recentOccurrences = {
        get: function (options) {
          return eventService.getByStackId(_stackId, options);
        },
        summary: {
          showType: false
        },
        options: {
          limit: 10,
          mode: 'summary'
        },
        source: source + '.Recent'
      };
      vm.stack = {};
      vm.stats = {};
      vm.updateIsCritical = updateIsCritical;
      vm.updateIsFixed = updateIsFixed;
      vm.updateIsHidden = updateIsHidden;
      vm.updateNotifications = updateNotifications;

      get().then(executeAction);
    }]);
}());
