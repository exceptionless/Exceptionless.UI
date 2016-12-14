/* global Rickshaw:false */
(function () {
  'use strict';

  angular.module('app')
    .controller('app.Dashboard', function ($ExceptionlessClient, $filter, $stateParams, eventService, filterService, notificationService, stackService) {
      var vm = this;
      function canRefresh(data) {
        if (!data || data.type !== 'PersistentEvent') {
          return true;
        }

        return filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
      }

      function get() {
        function onSuccess(response) {
          var results = response.data.plain();
          var first_occurrence = results.aggregations['min_date'].value;
          var last_occurrence = results.aggregations['max_date'].value;

          vm.stats = {
            total: $filter('number')(results.total, 0),
            unique: $filter('number')(results.aggregations['cardinality_stack_id'].value, 0),
            new: $filter('number')(results.aggregations['terms_is_first_occurrence'].items[0].total, 0),
            avg_per_hour: $filter('number')(eventService.calculateAveragePerHour(results.total, first_occurrence, last_occurrence), 1)
          };

          vm.chart.options.series[0].data = results.aggregations['date_date'].items.map(function (item) {
            return {x: moment.utc(item.date).unix(), y: item.aggregations['terms_is_first_occurrence'].items[0].total, data: item};
          });

          vm.chart.options.series[1].data = results.aggregations['date_date'].items.map(function (item) {
            return {x: moment.utc(item.date).unix(), y: item.aggregations['cardinality_stack_id'].value, data: item};
          });
        }

        return eventService.count('min:date max:date date:(date cardinality:stack_id terms:(is_first_occurrence @include:true)) cardinality:stack_id terms:(is_first_occurrence @include:true)').then(onSuccess).catch(function(e) {});
      }

      this.$onInit = function $onInit() {
        vm._source = 'app.Dashboard';
        vm.canRefresh = canRefresh;
        vm.chart = {
          options: {
            padding: {top: 0.085},
            renderer: 'stack',
            series: [{
              name: 'Unique',
              color: 'rgba(60, 116, 0, .9)',
              stroke: 'rgba(0, 0, 0, 0.15)'
            }, {
              name: 'Total',
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

        vm.mostFrequent = {
          get: stackService.getFrequent,
          options: {
            limit: 10,
            mode: 'summary'
          },
          source: vm._source + '.Frequent'
        };

        vm.mostRecent = {
          header: 'Most Recent',
          get: eventService.getAll,
          options: {
            limit: 10,
            mode: 'summary'
          },
          source: vm._source + '.Recent'
        };
        vm.stats = {
          total: 0,
          unique: 0,
          new: 0,
          avg_per_hour: 0.0
        };
        vm.type = $stateParams.type;

        get();
      };
    });
}());
