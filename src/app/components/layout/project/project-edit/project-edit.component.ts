import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from '../../../../service/filter.service';
import { OrganizationService } from '../../../../service/organization.service';
import { ProjectService } from '../../../../service/project.service';
import { TokenService } from '../../../../service/token.service';
import { WebHookService } from '../../../../service/web-hook.service';
import { NotificationService } from '../../../../service/notification.service';
import { environment } from '../../../../../environments/environment';
import * as moment from 'moment';
import * as Rickshaw from 'rickshaw';
import { WordTranslateService } from '../../../../service/word-translate.service';
import { BillingService } from '../../../../service/billing.service';
import { DialogService } from '../../../../service/dialog.service';

@Component({
    selector: 'app-project-edit',
    templateUrl: './project-edit.component.html'
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
                    const formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format('ddd, MMM D, YYYY') : date.format('ddd, MMM D, YYYY h:mma');
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
    isSlackEnabled = !!environment.SLACK_APPID;
    next_billing_date = moment().startOf('month').add(1, 'months').toDate();
    organization = {};
    project: any = {};
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
        private filterService: FilterService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private tokenService: TokenService,
        private webHookService: WebHookService,
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private billingService: BillingService,
        private dialogService: DialogService
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this._projectId = params['id'];
            this.get();
        });
    }

    ngOnInit() {
    }

    addConfiguration() {
        this.dialogService.addConfiguration(this.viewRef, this.saveClientConfiguration.bind(this));
    }

    saveClientConfiguration(data) {
        if (!data.value) {
            return;
        }

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the configuration setting.'));
        };

        return this.projectService.setConfig(this._projectId, data.key, data.value).toPromise().catch(onFailure.bind(this));
    }

    addSlack() {
        if (!this.hasPremiumFeatures) {
            return this.billingService.confirmUpgradePlan(this.viewRef, 'Please upgrade your plan to enable slack integration.', this.project.organization_id,() => {
                return this.addSlackIntegration();
            });
        }

        return this.addSlackIntegration();
    }

    async addSlackIntegration() {
        try {
            const res = await this.projectService.addSlack(this._projectId).toPromise();
            this.notificationService.success('', await this.wordTranslateService.translate('Successfully added'));
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while adding Slack to your project.'));
        }
    }

    async addToken() {
        const options = {
            organization_id: this.project['organization_id'],
            project_id: this._projectId
        };
        try {
            const res = await this.tokenService.create(options).toPromise();
            this.tokens.push(JSON.parse(JSON.stringify(res)));
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while creating a new API key for your project.'));
        }
    }

    addWebHook() {
        this.dialogService.addWebHook(this.viewRef, this.createWebHook.bind(this));
    }

    changePlan() {
        this.billingService.changePlan(this.viewRef, () => {}, this.project.organization.id);
    }

    createWebHook(data) {
        const onFailure = async (response) => {
            if (response.status === 426) {
                return this.billingService.confirmUpgradePlan(this.viewRef, response.error.message, this.project.organization_id, () => {
                    return this.createWebHook(data);
                });
            }
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the configuration setting.'));
        };

        return this.webHookService.create(Object.assign(data, {project_id: this._projectId})).toPromise().catch(onFailure.bind(this));
    }

    async copied() {
        this.notificationService.success('', await this.wordTranslateService.translate('Copied'));
    }

    async get(data?) {
        if (this._ignoreRefresh) {
            return;
        }

        if (data && data['type'] === 'Project' && data['deleted'] && data['id'] === this._projectId) {
            this.router.navigate(['/type/project/list']);
            this.notificationService.error('', await this.wordTranslateService.translate('Project_Deleted'));
            return;
        }

        try {
            await this.getProject();
            await this.getOrganization();
            await this.getConfiguration();
            await this.getTokens();
            await this.getSlackNotificationSettings();
            await this.getWebHooks();
        } catch (err) {}
    }

    async getOrganization() {
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
            this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && !!this.organization;

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
            console.log(this.seriesData);
            return this.organization;
        };

        try {
            const res = await this.organizationService.getById(this.project['organization_id']).toPromise();
            onSuccess(res);
            return this.organization;
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('Cannot_Find_Organization'));
            return err;
        }
    }

    async getProject() {
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
        try {
            const res = await this.projectService.getById(this._projectId).toPromise();
            onSuccess(res);
            return this.project;
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('Cannot_Find_Project'));
            return err;
        }
    }

    async getTokens() {
        const onSuccess = (response) => {
            const responseTokens = JSON.parse(JSON.stringify(response));
            responseTokens.forEach((item, key) => {
                this.editable[key] = false;
            });
            this.tokens = responseTokens;
            return this.tokens;
        };
        try {
            const res = await this.tokenService.getByProjectId(this._projectId).toPromise();
            onSuccess(res);
            return res;
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred loading the api keys.'));
            return err;
        }
    }

    async getConfiguration() {
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
                    this.config.push({key: key, value: response['settings'][key], is_editable: false});
                }
            });

            return this.config;
        };
        try {
            const res = await this.projectService.getConfig(this._projectId).toPromise();
            onSuccess(res);
            return this.project;
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred loading the notification settings.'));
            return err;
        }
    }

    async getSlackNotificationSettings() {
        this.slackNotificationSettings = null;
        try {
            const res = await this.projectService.getIntegrationNotificationSettings(this._projectId, 'slack').toPromise();
            this.slackNotificationSettings = JSON.parse(JSON.stringify(res));
            return this.slackNotificationSettings;
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading the slack notification settings.'));
            return err;
        }
    }

    async getWebHooks() {
        try {
            const res = await this.webHookService.getByProjectId(this._projectId).toPromise();
            this.webHooks = JSON.parse(JSON.stringify(res));
            return this.webHooks;
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred loading the notification settings.'));
            return err;
        }
    }

    async removeConfig(config) {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.projectService.removeConfig(this._projectId, config['key']).toPromise();
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to delete the configuration setting.'));
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to delete this configuration setting?', 'DELETE CONFIGURATION SETTING', modalCallBackFunction);
    }

    async removeProject() {
        const modalCallBackFunction = async () => {
            this._ignoreRefresh = true;
            try {
                const res = await this.projectService.remove(this._projectId).toPromise();
                this.router.navigate(['/project/list']);
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to delete the project.'));
                this._ignoreRefresh = false;
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to delete this project?', 'Delete Project', modalCallBackFunction);
    }

    async removeSlack() {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.projectService.removeSlack(this._projectId).toPromise();
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to remove slack.'));
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to remove slack support?', 'Remove Slack', modalCallBackFunction);
    }

    async removeToken(token) {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.tokenService.remove(token['id']).toPromise();
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to delete the API Key.'));
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to delete this API key?', 'DELETE API KEY', modalCallBackFunction);
    }

    async removeWebHook(hook) {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.webHookService.remove(hook['id']).toPromise();
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to delete the web hook.'));
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to delete this web hook?', 'DELETE WEB HOOK', modalCallBackFunction);
    }

    async resetData() {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.projectService.resetData(this._projectId).toPromise();
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while resetting project data.'));
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to reset the data for this project?', 'RESET PROJECT DATA', modalCallBackFunction);
    }

    async save(isValid) {
        if (!isValid) {
            return;
        }

        try {
            await this.projectService.update(this._projectId, this.project).toPromise();
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the project.'));
        }
    }

    async saveApiKeyNote(data) {
        try {
            await this.tokenService.update(data['id'], { notes: data.notes }).toPromise();
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the API key note.'));
        }
    }

    async saveCommonMethods() {
        const onSuccess = () => {
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the common methods.'));
        };

        if (this.common_methods) {
            try {
                await this.projectService.setData(this._projectId, 'CommonMethods', this.common_methods).toPromise();
                onSuccess();
            } catch (err) {
                onFailure();
            }
        } else {
            try {
                await this.projectService.removeData(this._projectId, 'CommonMethods').toPromise();
                onSuccess();
            } catch (err) {
                onFailure();
            }
        }
    }

    async saveDataExclusion() {
        const onSuccess = () => {
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the data exclusion.'));
        };

        if (this.data_exclusions) {
            try {
                await this.projectService.setConfig(this._projectId, '@@DataExclusions', this.data_exclusions).toPromise();
                onSuccess();
            } catch (err) {
                onFailure();
            }
        } else {
            try {
                await this.projectService.removeConfig(this._projectId, '@@DataExclusions').toPromise();
                onSuccess();
            } catch (err) {
                onFailure();
            }
        }
    }

    async saveDeleteBotDataEnabled() {
        try {
            await this.projectService.update(this._projectId, {'delete_bot_data_enabled': this.project['delete_bot_data_enabled']}).toPromise();
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the project.'));
        }
    }

    async saveUserAgents() {
        const onSuccess = () => {
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the user agents.'));
        };

        if (this.user_agents) {
            try {
                await this.projectService.setConfig(this._projectId, '@@UserAgentBotPatterns', this.user_agents).toPromise;
                onSuccess();
            } catch (err) {
                onFailure();
            }
        } else {
            try {
                await this.projectService.removeConfig(this._projectId, '@@UserAgentBotPatterns').toPromise();
                onSuccess();
            } catch (err) {
                onFailure();
            }
        }
    }

    async saveUserNamespaces() {
        const onSuccess = () => {
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving the user namespaces.'));
        };

        if (this.user_namespaces) {
            try {
                await this.projectService.setData(this._projectId, 'UserNamespaces', this.user_namespaces).toPromise();
                onSuccess();
            } catch (err) {
                onFailure();
            }
        } else {
            try {
                await this.projectService.removeData(this._projectId, 'UserNamespaces').toPromise();
                onSuccess();
            } catch (err) {
                onFailure();
            }
        }
    }

    async saveSlackNotificationSettings() {
        const onFailure = async (response) => {
            if (response.status === 426) {
                try {
                    return this.billingService.confirmUpgradePlan(this.viewRef, response.error.message, this.project['organization_id'], () => {
                        return this.saveSlackNotificationSettings();
                    });
                } catch (err) {
                    return this.getSlackNotificationSettings();
                }
            }

            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while saving your slack notification settings.'));
        };

        try {
            await this.projectService.setIntegrationNotificationSettings(this._projectId, 'slack', this.slackNotificationSettings).toPromise();
        } catch (err) {
            onFailure(err);
        }
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

    async validateClientConfiguration(original, data) {
        if (original === data) {
            return false;
        }

        return !data ? await this.wordTranslateService.translate('Please enter a valid value.') : null;
    }
}
