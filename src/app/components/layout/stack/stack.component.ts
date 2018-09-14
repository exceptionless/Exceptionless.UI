import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import * as moment from 'moment';
import { BillingService } from '../../../service/billing.service';
import { EventService } from '../../../service/event.service';
import { FilterService } from '../../../service/filter.service';
import { NotificationService } from '../../../service/notification.service';
import { OrganizationService } from '../../../service/organization.service';
import { ProjectService } from '../../../service/project.service';
import { StackService } from '../../../service/stack.service';
import { ModalDialogService } from 'ngx-modal-dialog';
import { FilterStoreService } from '../../../service/filter-store.service';
import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog.component';
import { AddReferenceDialogComponent } from '../../../dialogs/add-reference-dialog/add-reference-dialog.component';
import { ModalParameterService } from '../../../service/modal-parameter.service';
import { WordTranslateService } from '../../../service/word-translate.service';
import * as Rickshaw from 'rickshaw';

@Component({
    selector: 'app-stack',
    templateUrl: './stack.component.html'
})

export class StackComponent implements OnInit {
    _organizations = [];
    _stackId = '';
    eventType = 'stack';
    chart = {
        options: {
            padding: {top: 0.085},
            renderer: 'stack',
            stroke: true,
            unstack: true,
            series1: [],
        }
    };
    seriesData: any[];
    chartOptions = [
        { name: 'Occurrences', field: 'sum:count~1', title: '', selected: true, render: false },
        { name: 'Average Value', field: 'avg:value', title: 'The average of all event values', render: true },
        { name: 'Value Sum', field: 'sum:value', title: 'The sum of all event values', render: true }
    ];
    project = {};
    recentOccurrences = {
        get: (options) => {
            return this.eventService.getByStackId(this._stackId, options);
        },
        summary: {
            showType: false
        },
        options: {
            limit: 10,
            mode: 'summary'
        }
    };
    stack = {
        references: []
    };
    stats = {
        count: 0,
        users: this.buildUserStat(0, 0),
        usersTitle: this.buildUserStatTitle(0, 0),
        first_occurrence: undefined,
        last_occurrence: undefined
    };
    users = 0;
    total_users = 0;
    action = '';
    features: any = {
        hover: {
            render: function (args) {
                const date = moment.unix(args.domainX);
                const formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format('ddd, MMM D, YYYY') : date.format('ddd, MMM D, YYYY h:mma');
                let content = '<div class="date">' + formattedDate + '</div>';
                args.detail.sort(function (a, b) {
                    return a.order - b.order;
                }).forEach(function (d) {
                    const swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                    content += swatch + (d.formattedYValue * 1.0).toFixed(2) + ' ' + d.series.name + '<br />';
                }, this);

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
            onSelection: position => {
                const start = moment.unix(position.coordMinX).utc().local();
                const end = moment.unix(position.coordMaxX).utc().local();
                this.filterService.setTime(start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end.format('YYYY-MM-DDTHH:mm:ss'));

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
    };

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private hotkeysService: HotkeysService,
        private billingService: BillingService,
        private eventService: EventService,
        private filterService: FilterService,
        private notificationService: NotificationService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private stackService: StackService,
        private viewRef: ViewContainerRef,
        private modalDialogService: ModalDialogService,
        private modalParameterService: ModalParameterService,
        private filterStoreService: FilterStoreService,
        private wordTranslateService: WordTranslateService,
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this._stackId = params['id'];
            this.filterStoreService.setEventType(params['type']);
        });

        this.hotkeysService.add(new Hotkey('shift+h', (event: KeyboardEvent): boolean => {
            this.updateIsHidden();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('shift+f', (event: KeyboardEvent): boolean => {
            return false;
        }));

        this.hotkeysService.add(new Hotkey('shift+c', (event: KeyboardEvent): boolean => {
            this.updateIsCritical();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('shift+m', (event: KeyboardEvent): boolean => {
            this.updateNotifications();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('shift+p', (event: KeyboardEvent): boolean => {
            return false;
        }));

        this.hotkeysService.add(new Hotkey('shift+r', (event: KeyboardEvent): boolean => {
            this.addReferenceLink();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('shift+backspace', (event: KeyboardEvent): boolean => {
            return false;
        }));
    }

    ngOnInit() {
        this.get().then(() => { this.executeAction(); });
    }

    async addReferenceLink() {
        const modalCallBackFunction = () => {
            const url = this.modalParameterService.getModalParameter('referenceLink');
            if (this.stack['references'].indexOf(url) < 0) {
                this.stackService.addLink(this._stackId, url);

                return new Promise((resolve, reject) => {
                    this.stackService.addLink(this._stackId, url).subscribe(
                        res => {
                            this.stack['references'].push(url);
                            resolve(res);
                        },
                        async err => {
                            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while adding the reference link.'));
                            reject(err);
                        }
                    );
                });
            }
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: 'Select Date Range',
            childComponent: AddReferenceDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('Save Reference Link'), buttonClass: 'btn btn-primary', onAction: () => modalCallBackFunction() }
            ],
            data: {
                key: 'referenceLink'
            }
        });
    }

    buildUserStat(users, totalUsers) {
        if (this.total_users === 0) {
            return 0;
        }

        const percent = users / this.total_users * 100.0;
        return percent;
    }

    buildUserStatTitle(users, totalUsers) {
        return parseInt(users, 10) + ' of ' + parseInt(totalUsers, 10) +  ' users';
    }

    executeAction() {
        const action = this.action;
        if (action === 'mark-fixed' && !(this.stack['date_fixed'] && !this.stack['is_regressed'])) {
            return this.updateIsFixed(true);
        }

        if (action === 'stop-notifications' && !this.stack['disable_notifications']) {
            return this.updateNotifications(true);
        }
    }

    canRefresh(data) {
        if (data && data.type === 'Stack' && data.id === this._stackId) {
            return true;
        }

        if (data && data.type === 'PersistentEvent') {
            if (data['organization_id'] && data['organization_id'] !== this.stack['organization_id']) {
                return false;
            }
            if (data.project_id && data.project_id !== this.stack['project_id']) {
                return false;
            }

            if (data.stack_id && data.stack_id !== this._stackId) {
                return false;
            }

            return true;
        }

        return false;
    }

    async get(data?) {
        if (data && data.type === 'Stack' && data.deleted) {
            this.notificationService.error('', await this.wordTranslateService.translate('Stack_Deleted'));
            this.router.navigate(['/type/events/dashboard']);
            return;
        }

        if (data && data.type === 'PersistentEvent') {
            return this.updateStats();
        }

        return this.getStack().then(() => { this.updateStats().then(() => { this.getProject(); }); });
    }

    getOrganizations() {
        return new Promise((resolve, reject) => {
            this.organizationService.getAll('').subscribe(
                res => {
                    this._organizations = JSON.parse(JSON.stringify(res.body));

                    resolve(this._organizations);
                },
                err => {
                    this.notificationService.error('', 'Error Occurred!');
                    reject(err);
                }
            );
        });
    }

    getProject() {
        return new Promise((resolve, reject) => {
            this.projectService.getById(this.stack['project_id']).subscribe(
                res => {
                    this.project = JSON.parse(JSON.stringify(res));

                    resolve(this.project);
                },
                err => {
                    this.notificationService.error('', 'Error Occurred!');
                    reject(err);
                }
            );
        });
    }

    getStack() {
        return new Promise((resolve, reject) => {
            this.stackService.getById(this._stackId).subscribe(
                res => {
                    this.stack = JSON.parse(JSON.stringify(res.body));
                    this.stack['references'] = this.stack['references'] || [];
                    resolve(this.stack);
                },
                async err => {
                    if (err.status === 404) {
                        this.notificationService.error('', await this.wordTranslateService.translate('Cannot_Find_Stack'));
                    } else {
                        this.notificationService.error('', await this.wordTranslateService.translate('Error_Load_Stack'));
                    }

                    this.router.navigate(['/type/events/dashboard']);
                    reject(err);
                }
            );
        });
    }

    getProjectUserStats() {
        const optionsCallback = (options) => {
            options.filter = 'project:' + this.stack['project_id'];
            return options;
        };

        return new Promise((resolve, reject) => {
            this.eventService.count('cardinality:user', optionsCallback).subscribe(
                res => {
                    const getAggregationValue = (data, name, defaultValue) => {
                        const aggs = data['aggregations'];
                        return aggs && aggs[name] && aggs[name].value || defaultValue;
                    };

                    this.total_users = getAggregationValue(JSON.parse(JSON.stringify(res)), 'cardinality_user', 0);
                    this.stats['users'] = this.buildUserStat(this.users, this.total_users);
                    this.stats['usersTitle'] = this.buildUserStatTitle(this.users, this.total_users);
                    resolve(res);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    updateStats() {
        return this.getOrganizations().then(() => { this.getStats(); });
    }

    getStats() {
        const buildFields = (options) => {
            return ' cardinality:user ' + options.filter(function(option) { return option.selected; })
                .reduce(function(fields, option) { fields.push(option.field); return fields; }, [])
                .join(' ');
        };

        const optionsCallback = (options) => {
            options.filter = ['stack:' + this._stackId, options.filter].filter(function(f) { return f && f.length > 0; }).join(' ');
            return options;
        };

        const onSuccess = (response) => {
            const getAggregationValue = (data, name, defaultValue?) => {
                const aggs = data['aggregations'];
                return aggs && aggs[name] && aggs[name].value || defaultValue;
            };

            const getAggregationItems = (data, name, defaultValue?) => {
                const aggs = data['aggregations'];
                return aggs && aggs[name] && aggs[name].items || defaultValue;
            };

            const results = JSON.parse(JSON.stringify(response));
            this.users = getAggregationValue(results, 'cardinality_user', 0);
            this.stats = {
                count: getAggregationValue(results, 'sum_count', 0).toFixed(0),
                users: this.buildUserStat(this.users, this.total_users),
                usersTitle: this.buildUserStatTitle(this.users, this.total_users),
                first_occurrence: getAggregationValue(results, 'min_date'),
                last_occurrence: getAggregationValue(results, 'max_date')
            };

            const dateAggregation = getAggregationItems(results, 'date_date', []);
            const colors = ['rgba(124, 194, 49, .7)', 'rgba(60, 116, 0, .9)', 'rgba(89, 89, 89, .3)'];
            this.chart.options['series1'] = this.chartOptions
                .filter(function(option) { return option.selected; })
                .reduce(function (series, option, index) {
                    series.push({
                        name: option['name'],
                        stroke: 'rgba(0, 0, 0, 0.15)',
                        data: dateAggregation.map(function (item) {
                            const getYValue = (itemValue, key) => {
                                let field = option.field.replace(':', '_');
                                const proximity = field.indexOf('~');
                                if (proximity !== -1) {
                                    field = field.substring(0, proximity);
                                }

                                return getAggregationValue(itemValue, field, 0);
                            };
                            return { x: moment(item.key).unix(), y: getYValue(item, index), data: item };
                        })
                    });

                    return series;
                }, [])
                .sort((a, b) => {
                    const calculateSum = (previous, current) => {
                        return previous + current.y;
                    };

                    return b.data.reduce(calculateSum, 0) - a.data.reduce(calculateSum, 0);
                })
                .map(function(seri, index) {
                    seri.color = colors[index];
                    return seri;
                });

            this.seriesData = this.chart.options['series1'];
            return response;
        };

        const offset = this.filterService.getTimeOffset();

        return new Promise((resolve, reject) => {
            this.eventService.count('date:(date' + (offset ? '^' + offset : '') + buildFields(this.chartOptions) + ') min:date max:date cardinality:user sum:count~1', optionsCallback, false).subscribe(
                res => {
                    onSuccess(res);
                    this.getProjectUserStats();
                    resolve(res);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    hasSelectedChartOption() {
        return this.chartOptions.filter(function (o) { return o.render && o.selected; }).length > 0;
    }

    isValidDate(date) {
        const d = moment(date);
        return !!date && d.isValid() && d.year() > 1;
    }

    promoteToExternal() {
        if (this.project && !this['project.has_premium_features']) {
            const message = 'Promote to External is a premium feature used to promote an error stack to an external system. Please upgrade your plan to enable this feature.';
            /*return this.billingService.confirmUpgradePlan(message, this.stack['organization_id']).then(function () {
                return promoteToExternal();
            }).catch(function(e){});*/

            /*return new Promise((resolve, reject) => {
                this.billingService.confirmUpgradePlan(message,  this.stack['organization_id']).subscribe(
                    res => {
                        this.promoteToExternal();
                    },
                    err => {
                        reject(err);
                    },
                    () => console.log('Event Service called!')
                );
            });*/
        }

        const onSuccess = async () => {
            this.notificationService.success('', await this.wordTranslateService.translate('Successfully promoted stack!'));
        };

        const onFailure = async (response) => {
            if (response.status === 426) {
                /*return billingService.confirmUpgradePlan(response.data.message, vm.stack.organization_id).then(function () {
                    return promoteToExternal();
                }).catch(function(e){});*/
            }

            if (response.status === 501) {
                /*return dialogService.confirm(response.data.message, translateService.T('Manage Integrations')).then(function () {
                    $state.go('app.project.manage', { id: vm.stack.project_id });
                }).catch(function(e){});*/
            }

            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while promoting this stack.'));
        };

        return new Promise((resolve, reject) => {
            this.stackService.promote(this._stackId).subscribe(
                res => {
                    onSuccess();
                    resolve(res);
                },
                err => {
                    onFailure(err);
                    reject(err);
                }
            );
        });
    }

    async removeReferenceLink(reference) {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.stackService.removeLink(this._stackId, reference).subscribe(
                    res => {
                        this.stack['references'] = this.stack['references'].filter(item => item !== reference);
                        resolve(res);
                    },
                    async err => {
                        this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while deleting the external reference link.'));
                        reject(err);
                    }
                );
            });
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: await this.wordTranslateService.translate('DIALOGS_CONFIRMATION'),
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('DELETE REFERENCE LINK'), buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: await this.wordTranslateService.translate('Are you sure you want to delete this reference link?')
            }
        });
    }

    async remove() {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.stackService.remove(this._stackId).subscribe(
                    async res => {
                        this.notificationService.error('', await this.wordTranslateService.translate('Successfully queued the stack for deletion.'));
                        /*$state.go('app.project-dashboard', { projectId: vm.stack.project_id });*/
                        resolve(res);
                    },
                    async err => {
                        this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while deleting this stack.'));
                        reject(err);
                    }
                );
            });
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: await this.wordTranslateService.translate('DIALOGS_CONFIRMATION'),
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('DELETE STACK'), buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: await this.wordTranslateService.translate('Are you sure you want to delete this stack (includes all stack events)?')
            }
        });
    }

    updateIsCritical() {
        if (this.stack['occurrences_are_critical']) {
            this.stackService.markNotCritical(this._stackId).subscribe(
                res => {
                },
                async err => {
                    this.notificationService.error('', await this.wordTranslateService.translate(this.stack['occurrences_are_critical'] ? 'An error occurred while marking future occurrences as not critical.' : 'An error occurred while marking future occurrences as critical.'));
                }
            );
        }

        this.stackService.markCritical(this._stackId).subscribe(
            res => {
            },
            async err => {
                this.notificationService.error('', await this.wordTranslateService.translate(this.stack['occurrences_are_critical'] ? 'An error occurred while marking future occurrences as not critical.' : 'An error occurred while marking future occurrences as critical.'));
            }
        );
    }

    updateIsFixed(showSuccessNotification) {
        const onSuccess = async () => {
            if (!showSuccessNotification) {
                return;
            }

            this.notificationService.info('', await this.wordTranslateService.translate((this.stack['date_fixed'] && !this.stack['is_regressed']) ? 'Successfully queued the stack to be marked as not fixed.' : 'Successfully queued the stack to be marked as fixed.'));
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate((this['stack.date_fixed'] && !this.stack['is_regressed']) ? 'An error occurred while marking this stack as not fixed.' : 'An error occurred while marking this stack as fixed.'));
        };

        if (this['stack.date_fixed'] && !this.stack['is_regressed']) {
            return new Promise((resolve, reject) => {
                this.stackService.markNotFixed(this._stackId).subscribe(
                    res => {
                        onSuccess();
                        resolve(res);
                    },
                    err => {
                        onFailure();
                        reject(err);
                    }
                );
            });
        }

        return new Promise((resolve, reject) => {
            this.stackService.markFixed(this._stackId).subscribe(
                version => {
                    this.stackService.markFixed(this._stackId, JSON.parse(JSON.stringify(version))).subscribe(
                        res => {
                            onSuccess();
                            resolve(res);
                        },
                        err => {
                            onFailure();
                            reject(err);
                        }
                    );
                },
                err => {
                    onFailure();
                }
            );
        });
    }

    updateIsHidden() {
        const onSuccess = async () => {
            this.notificationService.info('', await this.wordTranslateService.translate(this.stack['is_hidden'] ? 'Successfully queued the stack to be marked as shown.' : 'Successfully queued the stack to be marked as hidden.'));
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate(this.stack['is_hidden'] ? 'An error occurred while marking this stack as shown.' : 'An error occurred while marking this stack as hidden.'));
        };

        this.stackService.markHidden(this._stackId).subscribe(
            async res => {
                this.notificationService.info('', await this.wordTranslateService.translate(this.stack['is_hidden'] ? 'Successfully queued the stack to be marked as shown.' : 'Successfully queued the stack to be marked as hidden.'));
            },
            async err => {
                this.notificationService.error('', await this.wordTranslateService.translate(this.stack['is_hidden'] ? 'An error occurred while marking this stack as shown.' : 'An error occurred while marking this stack as hidden.'));
            }
        );
    }

    updateNotifications(showSuccessNotification?) {
        const onSuccess = async () => {
            if (!showSuccessNotification) {
                return;
            }

            this.notificationService.info('', await this.wordTranslateService.translate(this.stack['disable_notifications'] ? 'Successfully enabled stack notifications.' : 'Successfully disabled stack notifications.'));
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate(this.stack['disable_notifications'] ? 'An error occurred while enabling stack notifications.' : 'An error occurred while disabling stack notifications.'));
        };

        if (this.stack['disable_notifications']) {
            return new Promise((resolve, reject) => {
                this.stackService.enableNotifications(this._stackId).subscribe(
                    res => {
                        onSuccess();
                        resolve(res);
                    },
                    err => {
                        onFailure();
                        reject(err);
                    }
                );
            });
        }

        return new Promise((resolve, reject) => {
            this.stackService.disableNotifications(this._stackId).subscribe(
                res => {
                    onSuccess();
                    resolve(res);
                },
                err => {
                    onFailure();
                    reject(err);
                }
            );
        });
    }
}
