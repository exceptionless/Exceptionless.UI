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
    seriesData: any[];
    chart = {
        options: {
            padding: {top: 0.085},
            renderer: 'multi',
            unstack: true,
            stroke: true,
            series1: [{
                name: 'Allowed in Organization',
                color: '#f5f5f5',
                renderer: 'area',
                data: []
                }, {
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
    isSlackEnabled = !!this._globalVariables.SLACK_APPID;
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
    editable = [];
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
        this.get();
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
                this.tokens.push(JSON.parse(JSON.stringify(res)));
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

    get(data?) {
        if (this._ignoreRefresh) {
            return;
        }

        if (data && data['type'] === 'Project' && data['deleted'] && data['id'] === this._projectId) {
            this.router.navigate(['/type/project/list']);
            this.notificationService.error('Failed!', 'Project_Deleted');
            return;
        }

        return this.getProject().then(() => { this.getOrganization().then(() => { this.getConfiguration().then(() => { this.getTokens().then(() => { this.getSlackNotificationSettings().then(() => { this.getWebHooks(); }); }); } ); }); });
    }

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


            this.chart.options.series1[0]['data'] = this.organization['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.total - item.blocked - item.too_big, data: item};
            });

            this.chart.options.series1[1]['data'] = this.project['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.total - item.blocked - item.too_big, data: item};
            });

            this.chart.options.series1[2]['data'] = this.project['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.blocked, data: item};
            });

            this.chart.options.series1[3]['data'] = this.project['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.too_big, data: item};
            });

            this.chart.options.series1[4]['data'] = this.organization['usage'].map((item) => {
                return {x: moment.utc(item.date).unix(), y: item.limit, data: item};
            });

            this.seriesData = this.chart.options.series1;
            return this.organization;
        };
        return new Promise((resolve, reject) => {
            this.organizationService.getById(this.project['organization_id']).subscribe(
                res => {
                    onSuccess(res);
                    resolve(this.organization);
                },
                err => {
                    this.notificationService.error('Failed!', 'Cannot_Find_Organization');
                    reject(err);
                }
            );
        });
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
        return new Promise((resolve, reject) => {
            this.projectService.getById(this._projectId).subscribe(
                res => {
                    onSuccess(res);
                    resolve(this.project);
                },
                err => {
                    // $state.go('app.project.list');
                    this.notificationService.error('Failed!', 'Cannot_Find_Project');
                    reject(err);
                }
            );
        });
    }

    getTokens() {
        const onSuccess = (response) => {
            const responseTokens = JSON.parse(JSON.stringify(response));
            responseTokens.forEach((item, key) => {
                this.editable[key] = false;
            });
            this.tokens = responseTokens;
            return this.tokens;
        };
        return new Promise((resolve, reject) => {
            return this.tokenService.getByProjectId(this._projectId).subscribe(
                res => {
                    onSuccess(res);
                    resolve(this.tokens);
                },
                err => {
                    this.notificationService.error('Failed!', 'An error occurred loading the api keys.');
                    reject(err);
                }
            );
        });
    }

    getConfiguration() {
        const onSuccess = (response) => {
            this.config = [];
            this.data_exclusions = null;
            this.user_agents = null;

            Object.keys(response['settings']).map((key) => {
                if (key === '@@DataExclusions') {
                    this.data_exclusions = response['settings'][key];
                } else if (key === '@@UserAgentBotPatterns') {
                    this.user_agents = response['settings'][key];
                } else {
                    this.config.push({key: key, value: response['settings'][key]});
                }
            });

            return this.config;
        };
        return new Promise((resolve, reject) => {
            this.projectService.getConfig(this._projectId).subscribe(
                res => {
                    onSuccess(res);
                    resolve(this.project);
                },
                err => {
                    // $state.go('app.project.list');
                    this.notificationService.error('Failed!', 'An error occurred loading the notification settings.');
                    reject(err);
                }
            );
        });
    }

    getSlackNotificationSettings() {
        this.slackNotificationSettings = null;
        return new Promise((resolve, reject) => {
            this.projectService.getIntegrationNotificationSettings(this._projectId, 'slack').subscribe(
                res => {
                    this.slackNotificationSettings = JSON.parse(JSON.stringify(res));
                    resolve(this.slackNotificationSettings);
                },
                err => {
                    // $state.go('app.project.list');
                    this.notificationService.error('Failed!', 'An error occurred while loading the slack notification settings.');
                    reject(err);
                }
            );
        });
    }

    getWebHooks() {
        return new Promise((resolve, reject) => {
            this.webHookService.getByProjectId(this._projectId).subscribe(
                res => {
                    this.webHooks = JSON.parse(JSON.stringify(res));
                    resolve(this.webHooks);
                },
                err => {
                    // $state.go('app.project.list');
                    this.notificationService.error('Failed!', 'An error occurred loading the notification settings.');
                    reject(err);
                }
            );
        });
    }

    removeConfig(config) {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.projectService.removeConfig(this._projectId, config['key']).subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully queued the configuration setting for deletion.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to delete the configuration setting.');
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
                { text: 'DELETE CONFIGURATION SETTING', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete this configuration setting?'
            }
        });
    }

    removeProject() {
        const modalCallBackFunction = () => {
            this._ignoreRefresh = true;
            return new Promise((resolve, reject) => {
                this.projectService.remove(this._projectId).subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully queued the project for deletion.');
                        this.router.navigate(['/type/project/list']);
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to delete the project.');
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
                { text: 'Delete Project', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete this project?'
            }
        });
    }

    removeSlack() {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.projectService.removeSlack(this._projectId).subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully queued the slack for deletion.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to remove slack.');
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
                { text: 'Remove Slack', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to remove slack support?'
            }
        });
    }

    removeToken(token) {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.tokenService.remove(token['id']).subscribe(
                    res => {
                        this.tokens.splice(this.tokens.indexOf(token), 1);
                        this.notificationService.success('Success!', 'Successfully queued the API Key for deletion.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to delete the API Key.');
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
                { text: 'DELETE API KEY', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete this API key?'
            }
        });
    }

    removeWebHook(hook) {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.webHookService.remove(hook['id']).subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully queued the web hook for deletion.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to delete the web hook.');
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
                { text: 'DELETE WEB HOOK', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete this web hook?'
            }
        });
    }

    resetData() {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.projectService.resetData(this._projectId).subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully queued the project for reset.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while resetting project data.');
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
                { text: 'RESET PROJECT DATA', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to reset the data for this project?'
            }
        });
    }

    save(isValid) {
        if (!isValid) {
            return;
        }
        return this.projectService.update(this._projectId, this.project).subscribe(
            res => {
                this.notificationService.success('Success!', 'Successfully queued the project for save.');
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred while saving the project.');
            }
        );
    }

    saveApiKeyNote(data) {
        return this.tokenService.update(data['id'], { notes: data.notes }).subscribe(
            res => {
                this.notificationService.success('Success!', 'Successfully queued the API key note for saving.');
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred while saving the API key note.');
            }
        );
    }

    saveClientConfiguration(data) {
        return this.projectService.setConfig(this._projectId, data['key'], data['value']).subscribe(
            res => {
                this.notificationService.success('Success!', 'Successfully queued the configuration setting for saving.');
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred while saving the configuration setting.');
            }
        );
    }

    saveCommonMethods() {
        const onSuccess = () => {
            this.notificationService.success('Success!', 'Successfully queued the common methods for saving.');
        };

        const onFailure = () => {
            this.notificationService.error('Failed!', 'An error occurred while saving the common methods.');
        };

        if (this.common_methods) {
            return this.projectService.setData(this._projectId, 'CommonMethods', this.common_methods).subscribe(
                res => {
                    onSuccess();
                },
                err => {
                    onFailure();
                }
            );
        } else {
            return this.projectService.removeData(this._projectId, 'CommonMethods').subscribe(
                res => {
                    onSuccess();
                },
                err => {
                    onFailure();
                }
            );
        }
    }

    saveDataExclusion() {
        const onSuccess = () => {
            this.notificationService.success('Success!', 'Successfully queued the data exclusion for saving.');
        };

        const onFailure = () => {
            this.notificationService.error('Failed!', 'An error occurred while saving the the data exclusion.');
        };

        if (this.data_exclusions) {
            return this.projectService.setConfig(this._projectId, '@@DataExclusions', this.data_exclusions).subscribe(
                res => {
                    onSuccess();
                },
                err => {
                    onFailure();
                }
            );
        } else {
            return this.projectService.removeConfig(this._projectId, '@@DataExclusions').subscribe(
                res => {
                    onSuccess();
                },
                err => {
                    onFailure();
                }
            );
        }
    }

    saveDeleteBotDataEnabled() {
        return this.projectService.update(this._projectId, {'delete_bot_data_enabled': this.project['delete_bot_data_enabled']}).subscribe(
            res => {
                this.notificationService.error('Success!', 'Successfully queued the bot data enabled for delete.');
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred while saving the project.');
            }
        );
    }

    saveUserAgents() {
        const onSuccess = () => {
            this.notificationService.success('Success!', 'Successfully queued the user agents for saving.');
        };

        const onFailure = () => {
            this.notificationService.error('Failed!', 'An error occurred while saving the user agents.');
        };

        if (this.user_agents) {
            return this.projectService.setConfig(this._projectId, '@@UserAgentBotPatterns', this.user_agents).subscribe(
                res => {
                    onSuccess();
                },
                err => {
                    onFailure();
                }
            );
        } else {
            return this.projectService.removeConfig(this._projectId, '@@UserAgentBotPatterns').subscribe(
                res => {
                    onSuccess();
                },
                err => {
                    onFailure();
                }
            );
        }
    }

    saveUserNamespaces() {
        const onSuccess = () => {
            this.notificationService.success('Success!', 'Successfully queued the namespaces for saving.');
        };

        const onFailure = () => {
            this.notificationService.error('Failed!', 'An error occurred while saving the user namespaces.');
        };

        if (this.user_namespaces) {
            return this.projectService.setData(this._projectId, 'UserNamespaces', this.user_namespaces).subscribe(
                res => {
                    onSuccess();
                },
                err => {
                    onFailure();
                }
            );
        } else {
            return this.projectService.removeData(this._projectId, 'UserNamespaces').subscribe(
                res => {
                    onSuccess();
                },
                err => {
                    onFailure();
                }
            );
        }
    }

    saveSlackNotificationSettings() {
        const onFailure = (response) => {
            /*if (response.status === 426) {
                return billingService.confirmUpgradePlan(response.data.message, vm.project.organization_id).then(function () {
                    return saveSlackNotificationSettings();
                }).catch(function(e){
                    return getSlackNotificationSettings();
                });
            }*/

            this.notificationService.error('Failed!', 'An error occurred while saving your slack notification settings.');
        };

        return this.projectService.setIntegrationNotificationSettings(this._projectId, 'slack', this.slackNotificationSettings).subscribe(
            res => {
                this.notificationService.success('Failed!', 'Successfully queued the slack notification for settings.');
            },
            err => {
                onFailure(err);
            }
        );
    }

    showChangePlanDialog() {
        // implement later Exceoptionless
    }

    validateApiKeyNote(original, data) {
        if (original === data) {
            return false;
        }

        return null;
    }

    validateClientConfiguration(original, data) {
        if (original === data) {
            return false;
        }

        return !data ? 'Please enter a valid value.' : null;
    }
}
