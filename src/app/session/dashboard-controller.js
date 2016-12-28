/* global Rickshaw:false */
(function () {
  'use strict';

  angular.module('app.session')
    .controller('session.Dashboard', function ($ExceptionlessClient, eventService, $filter, filterService, organizationService) {
      var vm = this;
      function get() {
        return getOrganizations().then(getStats).catch(function(e){});
      }

      function getStats() {
        function optionsCallback(options) {
          options.filter += ' type:session';
          return options;
        }

        function onSuccess(response) {
          var results = response.data.plain();
          vm.stats = {
            total: $filter('number')(results.total, 0),
            users: $filter('number')(results.aggregations['cardinality_user'].value, 0),
            avg_duration: results.aggregations['avg_value'].value,
            avg_per_hour: $filter('number')(eventService.calculateAveragePerHour(results.total, vm._organizations), 1)
          };

          var dateAggregation = results.aggregations['date_date'].items || [];
          vm.chart.options.series[0].data = dateAggregation.map(function (item) {
            return {x: moment(item.key).unix(), y: item.aggregations['avg_value'].value, data: item};
          });

          vm.chart.options.series[1].data = dateAggregation.map(function (item) {
            return {x: moment(item.key).unix(), y: item.aggregations['cardinality_user'].value, data: item};
          });
        }

        var offset = filterService.getTimeOffset();
        return eventService.count('date:(date' + (offset && '^' + offset) + ' avg:value cardinality:user)', optionsCallback).then(onSuccess);
      }

      function getOrganizations() {
        function onSuccess(response) {
          vm._organizations = response.data.plain();
          return vm._organizations;
        }

        return organizationService.getAll().then(onSuccess);
      }

      this.$onInit = function $onInit() {
        vm._organizations = [];
        vm._source = 'app.session.Dashboard';
        vm.chart = {
          options: {
            padding: {top: 0.085},
            renderer: 'stack',
            series: [{
              name: 'Users',
              color: 'rgba(60, 116, 0, .9)',
              stroke: 'rgba(0, 0, 0, 0.15)'
            }, {
              name: 'Sessions',
              color: 'rgba(124, 194, 49, .7)',
              stroke: 'rgba(0, 0, 0, 0.15)'
            }
            ],
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
                $ExceptionlessClient.createFeatureUsage(vm._source + '.chart.range.onSelection')
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
        vm.recentSessions = {
          get: function (options) {
            return eventService.getAllSessions(options);
          },
          summary: {
            showType: false
          },
          options: {
            limit: 10,
            mode: 'summary'
          },
          source: vm._source + '.Recent',
          hideActions: true
        };
        vm.stats = {
          total: 0,
          users: 0,
          avg_duration: undefined,
          avg_per_hour: 0.0
        };
        get();
      };
    });
}());
