import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from '../../../../service/filter.service';
import { OrganizationService } from '../../../../service/organization.service';
import { ProjectService } from '../../../../service/project.service';
import { UserService } from '../../../../service/user.service';
import { NotificationService } from '../../../../service/notification.service';
import * as moment from 'moment';
import * as Rickshaw from 'rickshaw';
import { AppConfigService } from '../../../../service/app-config.service';
import { WordTranslateService } from '../../../../service/word-translate.service';
import { BillingService } from '../../../../service/billing.service';
import { AppEventService } from '../../../../service/app-event.service';
import { DialogService } from '../../../../service/dialog.service';

@Component({
    selector: 'app-organization-edit',
    templateUrl: './organization-edit.component.html'
})

export class OrganizationEditComponent implements OnInit {
    _organizationId = '';
    _ignoreRefresh = false;
    canChangePlan = false;
    seriesData: any[];
    chart = {
        options: {
            padding: {top: 0.085},
            renderer: 'multi',
            series1: [{
                name: 'Allowed',
                color: '#a4d56f',
                renderer: 'stack',
                data: []
            }, {
                name: 'Blocked',
                color: '#e2e2e2',
                renderer: 'stack',
                data: []
            }, {
                name: 'Too Big',
                color: '#ccc',
                renderer: 'stack',
                data: []
            }, {
                name: 'Limit',
                color: '#a94442',
                renderer: 'dotted_line',
                data: []
            }]
        },
        features: {
            hover: {
                render: function (args) {
                    const date = moment.utc(args.domainX, 'X');
                    const dateTimeFormat = 'DateTimeFormat';
                    const formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format( 'ddd, MMM D, YYYY') : date.format('ddd, MMM D, YYYY h:mma');
                    let content = '<div class="date">' + formattedDate + '</div>';
                    args.detail.sort(function (a, b) {
                        return a.order - b.order;
                    }).forEach(function (d) {
                        const swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                        content += swatch + (d.formattedYValue * 1.0).toFixed(2) + ' ' + d.series.name + '<br />';
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

                    /*$state.go('app.organization-dashboard', { organizationId: vm.organization.id });*/
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
    hasMonthlyUsage = true;
    invoices = {
        get: (options) => {
            return this.organizationService.getInvoices(this._organizationId, options);
        },
        options: {
            limit: 12
        },
        organizationId: this._organizationId
    };
    next_billing_date = moment().startOf('month').add(1, 'months').toDate();
    organization = {};
    organizationForm = {};
    projects = {
        get: (options) => {
            return this.projectService.getByOrganizationId(this._organizationId, options);
        },
        organization: this._organizationId,
        options: {
            limit: 10,
            mode: 'stats'
        }
    };
    remainingEventLimit = 3000;
    users = {
        get: (options) => {
            return this.userService.getByOrganizationId(this._organizationId, options);
        },
        options: {
            limit: 10
        },
        organizationId: this._organizationId
    };
    activeTab = 'general';
    authUser: any = {};

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private viewRef: ViewContainerRef,
        private filterService: FilterService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private notificationService: NotificationService,
        private userService: UserService,
        private wordTranslateService: WordTranslateService,
        private billingService: BillingService,
        private appEvent: AppEventService,
        private dialogService: DialogService,
        private environment: AppConfigService
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this._organizationId = params['id'];
            this.users.organizationId = this._organizationId;
            this.get();
        });

        this.activatedRoute.queryParams.subscribe(params => {
            this.activeTab = params['tab'] || 'general';
        });
    }

    ngOnInit() {
        this.authUser = this.userService.authUser;
        this.appEvent.subscribe({
            next: (event: any) => {
                if (event.type === 'UPDATE_USER') {
                    this.authUser = this.userService.authUser;
                }
            }
        });
    }

    addUser() {
        this.dialogService.addUser(this.viewRef, this.createUser.bind(this));
    }

    changePlan() {
        this.billingService.changePlan(this.viewRef, () => {}, this._organizationId);
    }

    createUser(emailAddress) {
        const onFailure = async (response) => {
            if (response.status === 426) {
                return this.billingService.confirmUpgradePlan(this.viewRef, response.error.message, this._organizationId, () => {
                    return this.createUser(emailAddress);
                });
            }

            let message = await this.wordTranslateService.translate('An error occurred while inviting the user.');
            if (response.data && response.data.message) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.data.message;
            }

           this.notificationService.error('', message);
        };

        return this.organizationService.addUser(this._organizationId, emailAddress).subscribe(
            res => {
            },
            err => {
                onFailure(err);
            }
        );
    }

    get(data?) {
        if (this._ignoreRefresh) {
            return;
        }

        if (data && data['type'] === 'Organization' && data['deleted'] && data['id'] === this._organizationId) {
            this.router.navigate(['/type/organization/list']);
            this.notificationService.error('Failed!', 'Organization_Deleted');
            return;
        }

        return this.getOrganization();
    }

    getOrganization() {
        const onSuccess = (response) => {
            const getRemainingEventLimit = (organization) => {
                if (!organization.max_events_per_month) {
                    return 0;
                }

                const bonusEvents = moment.utc().isBefore(moment.utc(organization['bonus_expiration'])) ? organization['bonus_events_per_month'] : 0;
                const usage = organization.usage && organization.usage[this.organization['usage'].length - 1];
                if (usage && moment.utc(usage.date).isSame(moment.utc().startOf('month'))) {
                    const remaining = usage.limit - (usage.total - usage.blocked);
                    return remaining > 0 ? remaining : 0;
                }

                return organization.max_events_per_month + bonusEvents;
            };

            this.organization = JSON.parse(JSON.stringify(response));
            this.organization['usage'] = this.organization['usage'] || [{ date: moment.utc().startOf('month').toISOString(), total: 0, blocked: 0, limit: this.organization['max_events_per_month'], too_big: 0 }];
            this.hasMonthlyUsage = this.organization['max_events_per_month'] > 0;
            this.remainingEventLimit = getRemainingEventLimit(this.organization);
            this.canChangePlan = !!this.environment.config.STRIPE_PUBLISHABLE_KEY && !!this.organization;

            this.chart.options.series1[0]['data'] = this.organization['usage'].map(function (item) {
                return {x: moment.utc(item.date).unix(), y: item.total - item.blocked - item.too_big, data: item};
            });

            this.chart.options.series1[1]['data'] = this.organization['usage'].map(function (item) {
                return {x: moment.utc(item.date).unix(), y: item.blocked, data: item};
            });

            this.chart.options.series1[2]['data'] = this.organization['usage'].map(function (item) {
                return {x: moment.utc(item.date).unix(), y: item.too_big, data: item};
            });

            this.chart.options.series1[3]['data'] = this.organization['usage'].map(function (item) {
                return {x: moment.utc(item.date).unix(), y: item.limit, data: item};
            });

            this.seriesData = this.chart.options.series1;
            return this.organization;
        };

        const onFailure = async () => {
            this.router.navigate(['/type/organization/list']);
            this.notificationService.error('', await this.wordTranslateService.translate('Cannot_Find_Organization'));
        };

        return this.organizationService.getById(this._organizationId).subscribe(
            res => {
                onSuccess(res);
            },
            err => {
                onFailure();
            }
        );
    }

    hasAdminRole(user) {
        return this.userService.hasAdminRole(user);
    }

    async leaveOrganization(currentUser) {
        const modalCallBackFunction = async () => {
            this._ignoreRefresh = true;
            try {
                const res = await this.organizationService.removeUser(this._organizationId, currentUser['email_address']).toPromise();
                this.router.navigate(['/organization/list']);
                return res;
            } catch (err) {
                let message = await this.wordTranslateService.translate('An error occurred while trying to leave the organization.');
                if (err.status === 400) {
                    message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + err.data.message;
                }

                this.notificationService.error('', message);
                this._ignoreRefresh = false;
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to leave this organization?', 'Leave Organization', modalCallBackFunction);
    }

    async removeOrganization() {
        const modalCallBackFunction = async () => {
            this._ignoreRefresh = true;

            try {
                const res = await this.organizationService.remove(this._organizationId).toPromise();
                this.notificationService.success('', await this.wordTranslateService.translate('Successfully queued the organization for deletion.'));
                this.router.navigate(['/organization/list']);
                return res;
            } catch (err) {
                let message = await this.wordTranslateService.translate('An error occurred while trying to delete the organization.');
                if (err.status === 400) {
                    message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + err.data.message;
                }

                this.notificationService.error('', message);
                this._ignoreRefresh = false;
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to delete this organization?', 'Delete Organization', modalCallBackFunction);
    }

    save(isValid) {
        if (!isValid) {
            return;
        }
        return this.organizationService.update(this._organizationId, this.organization).subscribe(
            res => {
            },
            async err => {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the organization.'));
            }
        );
    }
}
