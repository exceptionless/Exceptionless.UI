(function () {
  'use strict';

  angular.module('app.session')
    .controller('session.Manage', ['$ExceptionlessClient', '$filter', '$state', '$stateParams', 'billingService', 'dialogs', 'dialogService', 'eventService', 'filterService', 'notificationService', 'projectService', 'statService', function ($ExceptionlessClient, $filter, $state, $stateParams, billingService, dialogs, dialogService, eventService, filterService, notificationService, projectService, statService) {
      var source = 'app.session.Session';
      var _sessionId = $stateParams.id;
      var vm = this;

      function get(data) {
        if (!!data && data.type === 'PersistentEvent' && data.project_id !== vm.event.project_id) {
          return;
        }

        return getSessionEvent().then(getStats).then(getProject);
      }

      function getProject() {
        function onSuccess(response) {
          vm.project = response.data.plain();
          return vm.project;
        }

        return projectService.getById(vm.event.project_id, true).then(onSuccess);
      }

      function getSessionEvent() {
        function onSuccess(response) {
          vm.event = response.data.plain()[0];
          if (!vm.event) {
            $state.go('app.session.dashboard');
            notificationService.error('No session events "' + _sessionId + '" could not be found.');
          }
        }

        function onFailure(response) {
          $state.go('app.session.dashboard');

          if (response.status === 404) {
            notificationService.error('No session events "' + _sessionId + '" could not be found.');
          } else {
            notificationService.error('An error occurred while loading a session event "' + _sessionId + '".');
          }
        }

        return eventService.getBySessionId(_sessionId, { sort: 'date', limit: 1 }).then(onSuccess, onFailure);
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
        return statService.getBySessionId(_sessionId, options).then(onSuccess);
      }

      function hasIdentity() {
        return vm.event.data && vm.event.data['@user'] && vm.event.data['@user'].identity;
      }

      function hasUserEmail() {
        return vm.event.data && vm.event.data['@user_description'] && vm.event.data['@user_description'].email_address;
      }

      function hasUserName() {
        return vm.event.data && vm.event.data['@user'] && vm.event.data['@user'].name;
      }

      function isValidDate(date) {
        var d = moment(date);
        return !!date && d.isValid() && d.year() > 1;
      }

      vm.chart = {
        options: {
          renderer: 'session',
          stroke: true,
          padding: {top: 0.085},
          series: [{
            name: 'Occurrences',
            color: 'rgba(124, 194, 49, .9)',
            stroke: 'rgba(0, 0, 0, 0.15)'
          }]
        },
        features: {
          hover: {
            render: function (args) {
              var date = moment.unix(args.domainX).utc();
              var formattedDate = date.hours() === 0 ? $filter('date')(date.toDate(), 'mediumDate') : $filter('date')(date.toDate(), 'medium');
              var content = '<div class="date">' + formattedDate + '</div>';
              args.detail.sort(function (a, b) {
                return a.order - b.order;
              }).forEach(function (d) {
                var swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                content += swatch + $filter('number')(d.value.data.total) + ' ' + d.series.name + ' <br />';
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
                .setProperty('id', _sessionId)
                .setProperty('start', start)
                .setProperty('end', end)
                .submit();

              return false;
            }
          },
          yAxis: {
            ticks: 5,
            tickFormat: 'formatKMBT',
            ticksTreatment: 'glow'
          }
        }
      };

      vm.event = {};
      vm.get = get;
      vm.hasIdentity = hasIdentity;
      vm.hasUserEmail = hasUserEmail;
      vm.hasUserName = hasUserName;
      vm.isValidDate = isValidDate;
      vm.project = {};
      vm.sessionEvents = {
        get: function (options) {
          return eventService.getBySessionId(_sessionId, options);
        },
        summary: {
          showType: true
        },
        options: {
          limit: 10,
          mode: 'summary'
        },
        hideActions: true,
        source: source + '.Recent'
      };
      vm.stats = {};

      get();
    }]);
}());
