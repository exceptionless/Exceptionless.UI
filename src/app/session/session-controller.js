(function () {
  'use strict';

  angular.module('app.session')
    .controller('session.Manage', ['$ExceptionlessClient', '$filter', '$state', '$stateParams', 'billingService', 'dialogs', 'dialogService', 'eventService', 'filterService', 'notificationService', 'statService', function ($ExceptionlessClient, $filter, $state, $stateParams, billingService, dialogs, dialogService, eventService, filterService, notificationService, statService) {
      var source = 'app.session.Session';
      var _sessionId = $stateParams.id;
      var vm = this;

      function get(data) {
        if (data && data.type === 'session' && data.id !== _sessionId) {
          return;
        }

        if (data && data.type === 'session' && data.deleted) {
          $state.go('app.dashboard');
          notificationService.error('The session "' + _sessionId + '" was deleted.');
          return;
        }

        if (data && data.type === 'PersistentEvent') {
          if (!data.deleted || data.project_id !== vm.session.project_id) {
            return;
          }
        }
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

      vm.get = get;
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
        source: source + '.Recent'
      };
      vm.session = {};
      vm.stats = {};

      get();
    }]);
}());
