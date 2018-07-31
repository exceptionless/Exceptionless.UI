import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from '../../../../service/filter.service';
import { OrganizationService } from '../../../../service/organization.service';
import { ProjectService } from '../../../../service/project.service';
import { UserService } from '../../../../service/user.service';
import { NotificationService } from '../../../../service/notification.service';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../../../../dialogs/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';
import * as Rickshaw from 'rickshaw';
import { GlobalVariables } from '../../../../global-variables';

@Component({
    selector: 'app-organization-edit',
    templateUrl: './organization-edit.component.html',
    styleUrls: ['./organization-edit.component.less']
})
export class OrganizationEditComponent implements OnInit {
    _organizationId = '';
    _ignoreRefresh = false;
    canChangePlan = false;
    chart = {
        options: {
            padding: {top: 0.085},
            renderer: 'multi',
            series1: [{
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
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private viewRef: ViewContainerRef,
        private modalDialogService: ModalDialogService,
        private filterService: FilterService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private notificationService: NotificationService,
        private userService: UserService,
        private _globalVariables: GlobalVariables,
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this._organizationId = params['id'];
        });
    }

    ngOnInit() {
        this.get();
    }

    addUser() {
        // return dialogs.create('app/organization/manage/add-user-dialog.tpl.html', 'AddUserDialog as vm').result.then(createUser);
    }

    changePlan() {
        // need to implement later
    }

    createUser(emailAddress) {
        const onFailure = (response) => {
            if (response.status === 426) {
                /*return billingService.confirmUpgradePlan(response.data.message, vm._organizationId).then(function() {
                    return createUser(emailAddress);
                }).catch(function(e){});*/
            }

            let message = 'An error occurred while inviting the user.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

           this.notificationService.error('Failed!', message);
        };

        return this.organizationService.addUser(this._organizationId, emailAddress).subscribe(
            res => {
                this.notificationService.success('Success!', 'Successfully invited new user!');
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
            this.canChangePlan = !!this._globalVariables.STRIPE_PUBLISHABLE_KEY && !!this.organization;

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

            return this.organization;
        };

        const onFailure = () => {
            this.router.navigate(['/type/organization/list']);
            this.notificationService.error('Failed!', 'Cannot_Find_Organization');
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

    leaveOrganization(currentUser) {
        const modalCallBackFunction = () => {
            this._ignoreRefresh = true;
            return new Promise((resolve, reject) => {
                this.organizationService.removeUser(this._organizationId, currentUser['email_address']).subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully queued the organization for leave.');
                        this.router.navigate(['/type/organization/list'])
                        resolve(res);
                    },
                    err => {
                        let message = 'An error occurred while trying to leave the organization.';
                        if (err.status === 400) {
                            message += ' ' + 'Message:' + ' ' + err.data.message;
                        }

                        this.notificationService.error('Failed!', message);
                        this._ignoreRefresh = false;
                        reject(err);
                    }
                );
            });
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: 'DIALOGS_CONFIRMATION',
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
                { text: 'Leave Organization', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to leave this organization?'
            }
        });
    }

    removeOrganization() {
        const modalCallBackFunction = () => {
            this._ignoreRefresh = true;
            return new Promise((resolve, reject) => {
                this.organizationService.remove(this._organizationId).subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully queued the organization for deletion.');
                        this.router.navigate(['/type/organization/list'])
                        resolve(res);
                    },
                    err => {
                        let message = 'An error occurred while trying to delete the organization.';
                        if (err.status === 400) {
                            message += ' ' + 'Message:' + ' ' + err.data.message;
                        }

                        this.notificationService.error('Failed!', message);
                        this._ignoreRefresh = false;
                        reject(err);
                    }
                );
            });
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: 'DIALOGS_CONFIRMATION',
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
                { text: 'Delete Organization', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete this organization?'
            }
        });
    }

    save(isValid) {
        if (!isValid) {
            return;
        }
        return this.organizationService.update(this._organizationId, this.organization).subscribe(
            res => {
                this.notificationService.success('Success!', 'Successfully queued for update');
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred while saving the organization.');
            }
        );
    }
}
