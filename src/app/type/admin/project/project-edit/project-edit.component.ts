import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from '../../../../service/filter.service';
import { OrganizationService } from '../../../../service/organization.service';
import { ProjectService } from '../../../../service/project.service';
import { TokenService } from '../../../../service/token.service';
import { WebHookService } from '../../../../service/web-hook.service';
import { NotificationService } from '../../../../service/notification.service';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../../../../dialogs/confirm-dialog/confirm-dialog.component';
import { GlobalVariables } from '../../../../global-variables';
import * as moment from 'moment';
import * as Rickshaw from 'rickshaw';

@Component({
    selector: 'app-project-edit',
    templateUrl: './project-edit.component.html',
    styleUrls: ['./project-edit.component.less']
})
export class ProjectEditComponent implements OnInit {
    _ignoreRefresh = false;
    _projectId = '';
    canChangePlan = false;
    chart = {
        options: {
            padding: {top: 0.085},
            renderer: 'multi',
            series: [{
                name: 'Allowed in Organization',
                color: '#f5f5f5',
                renderer: 'area'
            },
                {
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
                    const date = moment.utc(args.domainX, 'X');
                    const dateTimeFormat = 'DateTimeFormat';
                    const dateFormat = 'DateFormat';
                    const formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format(dateFormat || 'ddd, MMM D, YYYY') : date.format(dateTimeFormat || 'ddd, MMM D, YYYY h:mma');
                    let content = '<div class="date">' + formattedDate + '</div>';
                    args.detail.sort(function (a, b) {
                        return a.order - b.order;
                    }).forEach(function (d) {
                        const swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                        content += swatch + d.formattedYValue.toFixed(2) + ' ' + d.series.name + '<br />';
                    }, this);

                    content += '<span class="detail-swatch"></span>' + parseFloat(args.detail[1].value.data.total) + ' Total<br />';

                    const xLabel = document.createElement('div');
                    xLabel.className = 'x_label';
                    xLabel.innerHTML = content;
                    this.element.appendChild(xLabel);

                    // If left-alignment results in any error, try right-alignment.
                    const leftAlignError = this._calcLayoutError([xLabel]);
                    if (leftAlignError > 0) {
                        xLabel.classList.remove('left');
                        xLabel.classList.add('right');

                        // If right-alignment is worse than left alignment, switch back.
                        const rightAlignError = this._calcLayoutError([xLabel]);
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
                    const start = moment.unix(position.coordMinX).utc().local();
                    const end = moment.unix(position.coordMaxX).utc().local();

                    this.filterService.setTime(start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end.format('YYYY-MM-DDTHH:mm:ss'));

                    /*$state.go('app.project-dashboard', { projectId: vm.project.id });*/
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
    config = [];
    common_methods = null;
    data_exclusions = null;
    hasMonthlyUsage = true;
    hasPremiumFeatures = false;
    next_billing_date = moment().startOf('month').add(1, 'months').toDate();
    organization = {};
    project = {};
    projectForm = {};
    remainingEventLimit = 3000;
    slackNotificationSettings = null;
    tokens = [];
    user_agents = null;
    user_namespaces = null;
    webHooks = [];
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private viewRef: ViewContainerRef,
        private modalDialogService: ModalDialogService,
        private filterService: FilterService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private tokenService: TokenService,
        private webHookService: WebHookService,
        private notificationService: NotificationService,
        private _globalVariables: GlobalVariables
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this._projectId = params['id'];
        });
    }

    ngOnInit() {
    }

    addConfiguration() {
        // implement later Exceptionless
    }

    addSlack() {
        if (!this.hasPremiumFeatures) {
            // implement later Exceptionless
        }

        return this.addSlackIntegration();
    }

    addSlackIntegration() {
        return this.projectService.addSlack(this._projectId).subscribe(
            res => {
                this.notificationService.success('Success!', 'Successfully added');
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred while adding Slack to your project.');
            }
        );
    }

    addToken() {
        const options = {
            organization_id: this.project['organization_id'],
            project_id: this._projectId
        };
        return this.tokenService.create(options).subscribe(
            res => {
                this.notificationService.success('Success!', 'Successfully created new API');
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred while creating a new API key for your project.');
            }
        );
    }

    addWebHook() {
        // implement later Exceptionless
    }

    changePlan() {
        // implement later Exceoptionless
    }

    createWebHook(data) {
        const onFailure = (response) => {
            if (response.status === 426) {
                // implement later Exceptionless
            }

            this.notificationService.error('Failed!', 'An error occurred while saving the configuration setting.');
        };

        return this.webHookService.create(data).subscribe(
            res => {
                this.notificationService.success('Success!', 'Sucessfully Created');
            },
            err => {
                onFailure(err);
            }
        );
    }

    copied() {
        this.notificationService.success('Success!', 'Copied');
    }

    get(data) {}

    getOrganization() {
        const onSuccess = (response) => {
            const getRemainingEventLimit = (organization) => {
                if (!organization['max_events_per_month']) {
                    return 0;
                }

                const bonusEvents = moment.utc().isBefore(moment.utc(organization['bonus_expiration'])) ? organization['bonus_events_per_month'] : 0;
                const usage = organization['usage'] && organization['usage'][organization['usage'].length - 1];
                if (usage && moment.utc(usage.date).isSame(moment.utc().startOf('month'))) {
                    const remaining = usage.limit - (usage.total - usage.blocked);
                    return remaining > 0 ? remaining : 0;
                }

                return organization['max_events_per_month'] + bonusEvents;
            };

            this.organization = JSON.parse(JSON.stringify(response));
            this.hasMonthlyUsage = this.organization['max_events_per_month'] > 0;
            this.remainingEventLimit = getRemainingEventLimit(this.organization);
            this.canChangePlan = !!this._globalVariables.STRIPE_PUBLISHABLE_KEY && !!this.organization;

            this.organization['usage'] = (this.organization['usage'] || [{ date: moment.utc().startOf('month').toISOString(), total: 0, blocked: 0, limit: this.organization['max_events_per_month'], too_big: 0 }]).filter((usage) => {
                return this.project['usage'].some(function(u) { return moment(u.date).isSame(usage.date); });
            });


            this.chart.options.series[0]['data'] = this.organization['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.total - item.blocked - item.too_big, data: item};
            });

            this.chart.options.series[1]['data'] = this.project['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.total - item.blocked - item.too_big, data: item};
            });

            this.chart.options.series[2]['data'] = this.project['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.blocked, data: item};
            });

            this.chart.options.series[3]['data'] = this.project['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.too_big, data: item};
            });

            this.chart.options.series[4]['data'] = this.organization['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.limit, data: item};
            });

            return this.organization;
        };

        this.organizationService.getById(this.project['organization_id']).subscribe(
            res => {
                onSuccess(res);
            },
            err => {
                this.notificationService.error('Failed!', 'Cannot_Find_Organization');
            }
        );
    }

    getProject() {
        const onSuccess = (response) => {
            this.common_methods = null;
            this.user_namespaces = null;

            this.project = JSON.parse(JSON.stringify(response));
            this.hasPremiumFeatures = this.project['has_premium_features'];
            if (this.project && this.project['data']) {
                this.common_methods = this.project['data']['CommonMethods'];
                this.user_namespaces = this.project['data']['UserNamespaces'];
            }

            this.project['usage'] = this.project['usage'] || [{ date: moment.utc().startOf('month').toISOString(), total: 0, blocked: 0, limit: 3000, too_big: 0 }];
            return this.project;
        };
        return this.projectService.getById(this._projectId).subscribe(
            res => {
                onSuccess(res);
            },
            err => {
                // $state.go('app.project.list');
                this.notificationService.error('Failed!', 'Cannot_Find_Project');
            }
        );
    }

    getTokens() {
        const onSuccess = (response) => {
            this.tokens = JSON.parse(JSON.stringify(response));
            return this.tokens;
        };
        return this.tokenService.getByProjectId(this._projectId).subscribe(
            res => {
                onSuccess(res);
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred loading the api keys.');
            }
        );
    }
}
