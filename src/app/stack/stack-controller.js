/* global Rickshaw:false */
(function () {
  'use strict';

  angular.module('app.stack')
    .controller('Stack', ['$scope', '$ExceptionlessClient', '$filter', 'hotkeys', '$state', '$stateParams', 'billingService', 'dialogs', 'dialogService', 'eventService', 'filterService', 'notificationService', 'projectService', 'stackDialogService', 'stackService', 'statService', function ($scope, $ExceptionlessClient, $filter, hotkeys, $state, $stateParams, billingService, dialogs, dialogService, eventService, filterService, notificationService, projectService, stackDialogService, stackService, statService) {
      var source = 'app.stack.Stack';
      var _stackId = $stateParams.id;
      var vm = this;

      function addHotkeys() {
        function logFeatureUsage(name) {
          $ExceptionlessClient.createFeatureUsage(source + '.hotkeys' + name).addTags('hotkeys').submit();
        }

        hotkeys.del('shift+h');
        hotkeys.del('shift+f');
        hotkeys.del('shift+c');
        hotkeys.del('shift+m');
        hotkeys.del('shift+p');
        hotkeys.del('shift+r');
        hotkeys.del('shift+Fbackspace');

        hotkeys.bindTo($scope)
          .add({
            combo: 'shift+h',
            description: vm.isHidden() ? 'Mark Stack Unhidden' : 'Mark Stack Hidden',
            callback: function markHidden() {
              logFeatureUsage('Hidden');
              vm.updateIsHidden();
            }
          })
          .add({
            combo: 'shift+f',
            description: vm.isFixed() ? 'Mark Stack Not fixed' : 'Mark Stack Fixed',
            callback: function markFixed() {
              logFeatureUsage('Fixed');
              vm.updateIsFixed();
            }
          })
          .add({
            combo: 'shift+c',
            description: vm.isCritical() ? 'Future Stack Occurrences are Not Critical' : 'Future Stack Occurrences are Critical',
            callback: function markCritical() {
              logFeatureUsage('Critical');
              vm.updateIsCritical();
            }
          })
          .add({
            combo: 'shift+m',
            description: vm.notificationsDisabled() ? 'Enable Stack Notifications' : 'Disable Stack Notifications',
            callback: function updateNotifications() {
              logFeatureUsage('Notifications');
              vm.updateNotifications();
            }
          })
          .add({
            combo: 'shift+p',
            description: 'Promote Stack To External',
            callback: function promote() {
              logFeatureUsage('Promote');
              vm.promoteToExternal();
            }
          })
          .add({
            combo: 'shift+r',
            description: 'Add Stack Reference Link',
            callback: function addReferenceLink() {
              logFeatureUsage('Reference');
              vm.addReferenceLink();
            }
          })
          .add({
            combo: 'shift+backspace',
            description: 'Delete Stack',
            callback: function deleteStack() {
              logFeatureUsage('Delete');
              vm.remove();
            }
          });
      }

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

      function canRefresh(data) {
        if (data && data.type === 'Stack' && data.id === _stackId) {
          return true;
        }

        if (data && data.type === 'PersistentEvent') {
          if (data.organization_id && data.organization_id !== vm.stack.organization_id) {
            return false;
          }
          if (data.project_id && data.project_id !== vm.stack.project_id) {
            return false;
          }

          if (data.stack_id && data.stack_id !== _stackId) {
            return false;
          }

          return true;
        }

        return false;
      }

      function get(data) {
        if (data && data.type === 'Stack' && data.deleted) {
          $state.go('app.dashboard');
          notificationService.error('The stack "' + _stackId + '" was deleted.');
          return;
        }

        if (data && data.type === 'PersistentEvent') {
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
          addHotkeys();
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

      function getProjectUserStats() {
        function optionsCallback(options) {
          options.filter = 'project:' + vm.stack.project_id;
          return options;
        }

        function onSuccess(response) {
          vm.total_users = response.data.numbers[0] || 0;
          return response;
        }

        return statService.get('distinct:user.raw', optionsCallback).then(onSuccess);
      }

      function getStats() {
        function buildFields(options) {
          return 'distinct:user.raw' + options.filter(function(option) { return option.selected; })
            .reduce(function(fields, option) { fields.push(option.field); return fields; }, [])
            .join(',');
        }

        function optionsCallback(options) {
          options.filter = ['stack:' + _stackId, options.filter].filter(function(f) { return f && f.length > 0; }).join(' ');
          return options;
        }

        function onSuccess(response) {
          vm.stats = response.data.plain();
          if (!vm.stats.timeline) {
            vm.stats.timeline = [];
          }

          var colors = ['rgba(124, 194, 49, .7)', 'rgba(60, 116, 0, .9)', 'rgba(89, 89, 89, .3)'];
          vm.chart.options.series = vm.chartOptions
            .filter(function(option) { return option.selected; })
            .reduce(function (series, option, index) {
              series.push({
                name: option.name,
                stroke: 'rgba(0, 0, 0, 0.15)',
                data: vm.stats.timeline.map(function (item) {
                  return { x: moment.utc(item.date).unix(), y: (index === 0 ? item.total : item.numbers[index]), data: item };
                })
              });

              return series;
            }, [])
            .sort(function(a, b) {
              function calculateSum(previous, current) {
                return previous + current.y;
              }

              return b.data.reduce(calculateSum, 0) - a.data.reduce(calculateSum, 0);
            })
            .map(function(seri, index) {
              seri.color = colors[index];
              return seri;
            });

          return response;
        }

        return statService.getTimeline(buildFields(vm.chartOptions), optionsCallback).then(onSuccess).then(getProjectUserStats);
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

      function hasSelectedChartOption() {
        return vm.chartOptions.filter(function (o) { return o.render && o.selected; }).length > 0;
      }

      function hasSelectedOption() {
        return vm.isHidden() || vm.isCritical() || vm.notificationsDisabled();
      }

      function isCritical() {
        return vm.stack.occurrences_are_critical === true;
      }

      function isFixed() {
        return !!vm.stack.date_fixed && !isRegressed();
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

        return stackDialogService.markFixed().then(function (version) {
          return stackService.markFixed(_stackId, version).then(onSuccess, onFailure);
        });
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
                content += swatch + $filter('number')(d.formattedYValue) + ' ' + d.series.name + '<br />';
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

      vm.chartOptions = [
        { name: 'Occurrences', selected: true, render: false },
        { name: 'Average Value', field: 'avg:value', title: 'The average of all event values', render: true },
        { name: 'Value Sum', field: 'sum:value', title: 'The sum of all event values', render: true }
      ];

      vm.canRefresh = canRefresh;
      vm.get = get;
      vm.getStats = getStats;
      vm.hasTags = hasTags;
      vm.hasReference = hasReference;
      vm.hasReferences = hasReferences;
      vm.hasSelectedChartOption = hasSelectedChartOption;
      vm.hasSelectedOption = hasSelectedOption;
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
      vm.total_users = 0;
      vm.updateIsCritical = updateIsCritical;
      vm.updateIsFixed = updateIsFixed;
      vm.updateIsHidden = updateIsHidden;
      vm.updateNotifications = updateNotifications;

      get().then(executeAction);
    }]);
}());
