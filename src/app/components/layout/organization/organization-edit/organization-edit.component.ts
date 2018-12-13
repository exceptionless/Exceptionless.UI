import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from '../../../../service/filter.service';
import { OrganizationService } from '../../../../service/organization.service';
import { ProjectService } from '../../../../service/project.service';
import { UserService } from '../../../../service/user.service';
import { NotificationService } from '../../../../service/notification.service';
import * as moment from 'moment';
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
    apexChart: any = {
        options: {
            chart: {
                height: 200,
                type: 'area',
                stacked: true,
                events: {
                    zoomed: (chartContext, { xaxis, yaxis }) => {
                        const start = moment(xaxis.min).utc().local();
                        const end = moment(xaxis.max).utc().local();
                        this.filterService.setTime(start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end.format('YYYY-MM-DDTHH:mm:ss'));

                        // $ExceptionlessClient.createFeatureUsage('app.session.Dashboard.chart.range.onSelection')
                        //     .setProperty('start', start)
                        //     .setProperty('end', end)
                        //     .submit();

                        return false;
                    }
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy'
                    }
                }
            },
            colors: ['#a4d56f', '#e2e2e2', '#ccc', '#a94442'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth'
            },

            series: [],
            fill: {
                gradient: {
                    enabled: true,
                    opacityFrom: 0.6,
                    opacityTo: 0.8,
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left'
            },
            xaxis: {
                type: 'datetime'
            },
        },
        seriesData: []
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
        private dialogService: DialogService
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

    async createUser(emailAddress) {
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

        try {
            await this.organizationService.addUser(this._organizationId, emailAddress);
        } catch (err) {
            onFailure(err);
        }
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

    async getOrganization() {
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
            this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && !!this.organization;

            this.apexChart.seriesData = [];
            this.apexChart.seriesData.push({
                name: 'Allowed',
                data: this.organization['usage'].map(function (item) {
                    return [moment.utc(item.date), item.total - item.blocked - item.too_big];
                })
            });

            this.apexChart.seriesData.push({
                name: 'Blocked',
                data: this.organization['usage'].map(function (item) {
                    return [moment.utc(item.date), item.blocked];
                })
            });

            this.apexChart.seriesData.push({
                name: 'Too big',
                data: this.organization['usage'].map(function (item) {
                    return [moment.utc(item.date), item.too_big];
                })
            });

            this.apexChart.seriesData.push({
                name: 'Limit',
                data: this.organization['usage'].map(function (item) {
                    return [moment.utc(item.date), item.limit];
                })
            });
            this.seriesData = this.apexChart.seriesData;
            return this.organization;
        };

        const onFailure = async () => {
            this.router.navigate(['/type/organization/list']);
            this.notificationService.error('', await this.wordTranslateService.translate('Cannot_Find_Organization'));
        };

        try {
            const res = await this.organizationService.getById(this._organizationId);
            onSuccess(res);
        } catch (err) {
            onFailure();
        }
    }

    hasAdminRole(user) {
        return this.userService.hasAdminRole(user);
    }

    async leaveOrganization(currentUser) {
        const modalCallBackFunction = async () => {
            this._ignoreRefresh = true;
            try {
                const res = await this.organizationService.removeUser(this._organizationId, currentUser['email_address']);
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
                const res = await this.organizationService.remove(this._organizationId);
                this.notificationService.success('', await this.wordTranslateService.translate('Successfully queued the organization for deletion.'));
                this.router.navigate(['/organization/list']);
                return res;
            } catch (err) {
                let message = await this.wordTranslateService.translate('An error occurred while trying to delete the organization.');
                if (err.status === 400) {
                    message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + err.error.message;
                }

                this.notificationService.error('', message);
                this._ignoreRefresh = false;
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to delete this organization?', 'Delete Organization', modalCallBackFunction);
    }

    async save(isValid) {
        if (!isValid) {
            return;
        }
        try {
            await this.organizationService.update(this._organizationId, this.organization);
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the organization.'));
        }
    }
}
