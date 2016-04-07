/* global Rickshaw:false */
(function () {
  'use strict';

  angular.module('app.organization')
    .controller('organization.Manage', ['$ExceptionlessClient', 'filterService', '$filter', '$state', '$stateParams', '$window', 'billingService', 'dialogService', 'organizationService', 'projectService', 'userService', 'notificationService', 'dialogs', 'STRIPE_PUBLISHABLE_KEY', function ($ExceptionlessClient, filterService, $filter, $state, $stateParams, $window, billingService, dialogService, organizationService, projectService, userService, notificationService, dialogs, STRIPE_PUBLISHABLE_KEY) {
      var source = 'organization.Manage';
      var _ignoreRefresh = false;
      var _organizationId = $stateParams.id;
      var vm = this;

      function activateTab(tabName) {
        switch (tabName) {
          case 'projects':
            vm.activeTabIndex = 1;
            break;
          case 'users':
            vm.activeTabIndex = 2;
            break;
          case 'billing':
            vm.activeTabIndex = 3;
            break;
          default:
            vm.activeTabIndex = 0;
            break;
        }
      }

      function addUser() {
        return dialogs.create('app/organization/manage/add-user-dialog.tpl.html', 'AddUserDialog as vm').result.then(createUser);
      }

      function canChangePlan() {
        return STRIPE_PUBLISHABLE_KEY && vm.organization;
      }

      function changePlan() {
        return billingService.changePlan(vm.organization.id);
      }

      function createUser(emailAddress) {
        function onFailure(response) {
          if (response.status === 426) {
            return billingService.confirmUpgradePlan(response.data.message).then(function() {
              return createUser(emailAddress);
            });
          }

          var message = 'An error occurred while inviting the user.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return organizationService.addUser(_organizationId, emailAddress).catch(onFailure);
      }

      function get(data) {
        if (_ignoreRefresh) {
          return;
        }

        if (data && data.type === 'Organization' && data.deleted && data.id === _organizationId) {
          $state.go('app.dashboard');
          notificationService.error('The organization "' + _organizationId + '" was deleted.');
          return;
        }

        return getOrganization();
      }

      function getOrganization() {
        function onSuccess(response) {
          vm.organization = response.data.plain();
          vm.organization.usage = vm.organization.usage || [{ date: moment.utc().startOf('month').toISOString(), total: 0, blocked: 0, limit: vm.organization.max_events_per_month, too_big: 0 }];
          vm.hasMonthlyUsage = vm.organization.max_events_per_month > 0;

          vm.chart.options.series[0].data = vm.organization.usage.map(function (item) {
            return {x: moment.utc(item.date).unix(), y: item.total - item.blocked - item.too_big, data: item};
          });

          vm.chart.options.series[1].data = vm.organization.usage.map(function (item) {
            return {x: moment.utc(item.date).unix(), y: item.blocked, data: item};
          });

          vm.chart.options.series[2].data = vm.organization.usage.map(function (item) {
            return {x: moment.utc(item.date).unix(), y: item.too_big, data: item};
          });

          vm.chart.options.series[3].data = vm.organization.usage.map(function (item) {
            return {x: moment.utc(item.date).unix(), y: item.limit, data: item};
          });
        }

        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The organization "' + _organizationId + '" could not be found.');
        }

        return organizationService.getById(_organizationId, false).then(onSuccess, onFailure);
      }

      function getRemainingEventLimit() {
        if (!vm.organization.max_events_per_month) {
          return 0;
        }

        var bonusEvents = moment.utc().isBefore(moment.utc(vm.organization.bonus_expiration)) ? vm.organization.bonus_events_per_month : 0;
        var usage = vm.organization.usage && vm.organization.usage[vm.organization.usage.length - 1];
        if (usage && moment.utc(usage.date).isSame(moment.utc().startOf('month'))) {
          var remaining = usage.limit - (usage.total - usage.blocked - usage.too_big);
          return remaining > 0 ? remaining : 0;
        }

        return vm.organization.max_events_per_month + bonusEvents;
      }

      function hasAdminRole(user) {
        return userService.hasAdminRole(user);
      }

      function hasPremiumFeatures() {
        return vm.organization && vm.organization.has_premium_features;
      }

      function leaveOrganization(currentUser){
        return dialogService.confirmDanger('Are you sure you want to leave this organization?', 'LEAVE ORGANIZATION').then(function () {
          function onSuccess() {
            $state.go('app.organization.list');
          }

          function onFailure(response) {
            var message = 'An error occurred while trying to leave the organization.';
            if (response.status === 400) {
              message += ' Message: ' + response.data.message;
            }

            notificationService.error(message);
            _ignoreRefresh = false;
          }

          _ignoreRefresh = true;
          return organizationService.removeUser(_organizationId, currentUser.email_address).then(onSuccess, onFailure);
        });
      }

      function removeOrganization() {
        return dialogService.confirmDanger('Are you sure you want to delete this organization?', 'DELETE ORGANIZATION').then(function () {
          function onSuccess() {
            notificationService.info('Successfully queued the organization for deletion.');
            $state.go('app.organization.list');
          }

          function onFailure(response) {
            var message = 'An error occurred while trying to delete the organization.';
            if (response.status === 400) {
              message += ' Message: ' + response.data.message;
            }

            notificationService.error(message);
            _ignoreRefresh = false;
          }

          _ignoreRefresh = true;
          return organizationService.remove(_organizationId).then(onSuccess, onFailure);
        });
      }

      function save(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure() {
          notificationService.error('An error occurred while saving the organization.');
        }

        return organizationService.update(_organizationId, vm.organization).catch(onFailure);
      }

      vm.activeTabIndex = 0;
      vm.addUser = addUser;
      vm.canChangePlan = canChangePlan;
      vm.changePlan = changePlan;
      vm.chart = {
        options: {
          padding: { top: 0.085 },
          renderer: 'multi',
          series: [{
            name: 'Allowed',
            color: '#a4d56f',
            renderer: 'stack'
          }, {
            name: 'Blocked',
            color: '#e2e2e2',
            renderer: 'stack'
          }, {
            name: 'Too Big',
            color: '#ccc',
            renderer: 'stack'
          }, {
            name: 'Limit',
            color: '#a94442',
            renderer: 'dotted_line'
          }]
        },
        features: {
          hover: {
            render: function (args) {
              var date = moment.utc(args.domainX, 'X');
              var formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format('ddd, MMM D, YYYY') : date.format('ddd, MMM D, YYYY h:mma');
              var content = '<div class="date">' + formattedDate + '</div>';
              args.detail.sort(function (a, b) {
                return a.order - b.order;
              }).forEach(function (d) {
                var swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                content += swatch + $filter('number')(d.formattedYValue) + ' ' + d.series.name + '<br />';
              }, this);

              content += '<span class="detail-swatch"></span>' + $filter('number')(args.detail[0].value.data.total) + ' Total<br />';

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
      vm.getRemainingEventLimit = getRemainingEventLimit;
      vm.hasAdminRole = hasAdminRole;
      vm.hasPremiumFeatures = hasPremiumFeatures;
      vm.hasMonthlyUsage = true;
      vm.invoices = {
        get: function (options, useCache) {
          return  organizationService.getInvoices(_organizationId, options, useCache);
        },
        options: {
          limit: 12
        },
        organizationId: _organizationId
      };
      vm.leaveOrganization = leaveOrganization;
      // NOTE: this is currently the end of each month until we change our system to use the plan changed date.
      vm.next_billing_date = moment().startOf('month').add(1, 'months').toDate();
      vm.organization = {};
      vm.organizationForm = {};
      vm.projects = {
        get: function (options, useCache) {
          return projectService.getByOrganizationId(_organizationId, options, useCache);
        },
        hideOrganizationName: true,
        options: {
          limit: 10,
          mode: 'stats'
        }
      };
      vm.removeOrganization = removeOrganization;
      vm.save = save;
      vm.users = {
        get: function (options, useCache) {
          return userService.getByOrganizationId(_organizationId, options, useCache);
        },
        options: {
          limit: 10
        },
        organizationId: _organizationId
      };

      activateTab($stateParams.tab);
      get();
    }]);
}());
