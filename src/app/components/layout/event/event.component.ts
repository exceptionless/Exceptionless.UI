import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { ClipboardService } from 'ngx-clipboard';
import * as moment from 'moment';
import { BillingService } from '../../../service/billing.service';
import { ErrorService } from '../../../service/error.service';
import { EventService } from '../../../service/event.service';
import { FilterService } from '../../../service/filter.service';
import { LinkService } from '../../../service/link.service';
import { NotificationService } from '../../../service/notification.service';
import { ProjectService } from '../../../service/project.service';
import { WordTranslateService } from '../../../service/word-translate.service';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { $ExceptionlessClient } from '../../../exceptionlessclient';
import { UrlService } from '../../../service/url.service';

@Component({
    selector: 'app-event',
    templateUrl: './event.component.html'
})

export class EventComponent implements OnInit, OnDestroy {
    _source = 'app.event.Event';
    eventId = '';
    _knownDataKeys = ['error', '@error', '@simple_error', '@request', '@trace', '@environment', '@user', '@user_description', '@version', '@level', '@location', '@submission_method', '@submission_client', 'session_id', 'sessionend', 'haserror', '@stack'];
    activeTabIndex = -1;
    event = {
        data: {
            '@error': ''
        }
    };
    event_json = '';
    textStackTrace = '';
    excludedAdditionalData = ['@browser', '@browser_version', '@browser_major_version', '@device', '@os', '@os_version', '@os_major_version', '@is_bot'];
    location = '';
    isSessionStart = false;
    level = '';
    isLevelSuccess = false;
    isLevelInfo = false;
    isLevelWarning = false;
    isLevelError = false;
    hasCookies = false;
    hasError = false;
    version = '';
    project = {};
    references = [];
    sessionEvents = {
        get: (options, event?) => {
            let curEvent = event;
            if (!curEvent) {
                curEvent = this.event;
            }
            const optionsCallback = (option) => {
                option.filter = '-type:heartbeat';

                const start = moment.utc(curEvent['date']).local();
                const end = (curEvent['data'] && curEvent['data']['sessionend']) ? moment.utc(curEvent['data']['sessionend']).add(1, 'seconds').local().format('YYYY-MM-DDTHH:mm:ss') : 'now';
                option.time = start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end;
                return option;
            };

            const serialize = (obj) => {
                const str = [];
                for (const p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                    }
                }
                return str.join('&');
            };

            let requestOptions: any = this.filterService.getDefaultOptions(false);
            Object.assign(requestOptions, optionsCallback(options));
            requestOptions = serialize(requestOptions);
            return this.eventService.getBySessionId(curEvent['project_id'], curEvent['reference_id'], requestOptions);
        },
        options: {
            limit: 10,
            mode: 'summary'
        },
        timeHeaderText: 'Session Time',
        hideActions: true,
        hideSessionStartTime: true
    };
    tabs = [];
    activedTab = 'overview';
    tabHistory = [];
    previous = '';
    next = '';
    clipboardSupported = this.clipboardService.isSupported;
    template: any;
    @ViewChild('tabsChild') tabsChild: NgbTabset;
    subscriptions: any;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private hotkeysService: HotkeysService,
        private clipboardService: ClipboardService,
        private billingService: BillingService,
        private errorService: ErrorService,
        private eventService: EventService,
        private filterService: FilterService,
        private linkService: LinkService,
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private wordTranslateService: WordTranslateService,
        private viewRef: ViewContainerRef,
        private urlService: UrlService
    ) {}

    ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.activatedRoute.params.subscribe( (params) => {
            if (this.eventId !== params['id']) {
                this.eventId = params['id'];
                this.get();
            }
        }));

        this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
            /*this.activedTab = params['tab'];*/
        }));
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    async get() {
        try {
            await this.getEvent();
            await this.getProject();
            await this.buildTabs(this.activedTab);
        } catch (err) {}
    }

    addHotKeys() {
        if (this.event['stack_id']) {
            this.hotkeysService.add(new Hotkey('mod+up', (event: KeyboardEvent): boolean => {
                $ExceptionlessClient.createFeatureUsage(`${this._source}.hotkeys.GoToStack`)
                    .addTags('hotkeys')
                    .setProperty('id', this.eventId)
                    .submit();
                this.router.navigate([`/type/event/${this.eventId}`]);
                return false;
            }));

            if (this.clipboardService.isSupported) {
                this.hotkeysService.add(new Hotkey('mod+shift+c', (event: KeyboardEvent): boolean => {
                    $ExceptionlessClient.createFeatureUsage(`${this._source}.hotkeys.CopyEventJSON`)
                        .addTags('hotkeys')
                        .setProperty('id', this.eventId)
                        .submit();
                    this.clipboardService.copyFromContent(this.event_json);
                    return false;
                }));
            }
        }

        if (this.previous) {
            this.hotkeysService.add(new Hotkey('mod+left', (event: KeyboardEvent): boolean => {
                $ExceptionlessClient.createFeatureUsage(`${this._source}.hotkeys.PreviousOccurrence`)
                    .addTags('hotkeys')
                    .setProperty('id', this.eventId)
                    .submit();
                this.router.navigate([`/type/event/${this.previous}`], { queryParams: { tab: this.getCurrentTab() } });
                return false;
            }));
        }

        if (this.next) {
            this.hotkeysService.add(new Hotkey('mod+left', (event: KeyboardEvent): boolean => {
                $ExceptionlessClient.createFeatureUsage(`${this._source}.hotkeys.NextOccurrence`)
                    .addTags('hotkeys')
                    .setProperty('id', this.eventId)
                    .submit();
                this.router.navigate([`/type/event/${this.next}`], { queryParams: { tab: this.getCurrentTab() } });
                return false;
            }));
        }
    }

    activateTab(tabName) {
        for (let index = 0; index < this.tabs.length; index++) {
            const tab = this.tabs[index];
            if (tab.title !== tabName) {
                tab.active = false;
                continue;
            }

            tab.active = true;
            this.activeTabIndex = tab.index;
            this.activedTab = tab.template_key;
            break;
        }

        if (this.activeTabIndex < 0 || this.activeTabIndex >= this.tabs.length) {
            this.tabs[0].active = true;
            this.activeTabIndex = 0;
            this.activedTab = this.tabs[0].template_key;
        }
    }

    buildReferences() {
        const toSpacedWords = (value) => {
            value = value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
            value = value.replace(/([a-z0-9])([A-Z0-9])/g, '$1 $2');
            return value.length > 1 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        };

        this.references = [];

        const referencePrefix = '@ref:';

        Object.keys(this.event['data']).map((key) => {
            if (key.startsWith(referencePrefix)) {
                this.references.push({ id: this.event['data'][key], name: toSpacedWords(key.slice(5)) });
            }
        });
    }

    buildTabs(tabNameToActivate) {
        let tabIndex = 0;
        let promotedIndex = 0;
        let tabs: Array<{index: number, title: string, template_key: string, data?: any}> = [];
        tabs = [{index: tabIndex, title: 'Overview', template_key: 'overview'}];

        if (this.event['reference_id'] && this.isSessionStart) {
            tabs.push({index: ++tabIndex, title: 'Session Events', template_key: 'session'});
        }

        if (this.event['data'] && this.event['data']['@error']) {
            tabs.push({index: ++tabIndex, title: 'Exception', template_key: 'error'});
        } else if (this.event['data'] && this.event['data']['@simple_error']) {
            tabs.push({index: ++tabIndex, title: 'Exception', template_key: 'simple-error'});
        }

        if (this.event['request'] && Object.keys(this.event['request']).length > 0) {
            tabs.push({index: ++tabIndex, title: this.isSessionStart ? 'Browser' : 'Request', template_key: 'request'});
        }

        if (this.event['environment'] && Object.keys(this.event['environment']).length > 0) {
            console.log('event-environment');
            console.log(this.event['environment']);
            tabs.push({index: ++tabIndex, title: 'Environment', template_key: 'environment'});
        }

        const extendedDataItems = [];

        Object.keys(this.event['data']).map((key) => {
            if (key === '@trace') {
                key = 'Trace Log';
            }

            if (key.startsWith('@')) {
                return;
            }

            if (this.isPromoted(key)) {
                tabs.push({index: ++tabIndex, title: key, template_key: 'promoted-' + promotedIndex, data: this.event['data'][key]});
                promotedIndex ++;
            } else if (this._knownDataKeys.indexOf(key) < 0) {
                extendedDataItems.push({title: key, data: this.event['data'][key]});
            }
        });

        if (extendedDataItems.length > 0) {
            tabs.push({index: ++tabIndex, title: 'Extended Data', template_key: 'extended-data', data: extendedDataItems});
        }


        this.tabs = tabs;

        console.log(this.tabs);

        if (tabNameToActivate) {
            setTimeout(() => {
                this.activateTab(tabNameToActivate);
            }, 500);
        }
    }

    canRefresh(data) {
        if (!!data && data['type'] === 'PersistentEvent') {
            // Refresh if the event id is set (non bulk) and the deleted event matches one of the events.
            if (data['id'] && this.event['id']) {
                return data['id'] === this.event['id'];
            }

            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: data['organization_id'], projectId: data['project_id'] });
        }

        if (!!data && data['type'] === 'Stack') {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: data['organization_id'], projectId: data['project_id'] });
        }

        if (!!data && data.type === 'Organization' || data.type === 'Project') {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: data['id'], projectId: data['id'] });
        }

        return !data;
    }

    async demoteTab(tabName) {
        const onSuccess = () => {
            $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab.success`)
                .setProperty('id', this.eventId)
                .setProperty('TabName', tabName)
                .submit();

            this.project['promoted_tabs'].splice(indexOf, 1);
            this.buildTabs('Extended Data');
        };

        const onFailure = async (response) => {
            $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab.error`)
                .setProperty('id', this.eventId)
                .setProperty('response', response)
                .setProperty('TabName', tabName)
                .submit();

            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred promoting tab.'));
        };

        const indexOf = this.project['promoted_tabs'].indexOf(tabName);
        if (indexOf < 0) {
            return;
        }

        $ExceptionlessClient.createFeatureUsage(`${this._source}.demoteTab`)
            .setProperty('id', this.eventId)
            .setProperty('TabName', tabName)
            .submit();

        try {
            await this.projectService.demoteTab(this.project['id'], tabName);
            onSuccess();
        } catch (err) {
            onFailure(err);
        }
    }

    getPreviousTab() {
        const currentTab = this.getCurrentTab();
        const tabIndex = this.tabHistory.lastIndexOf(currentTab);
        if (tabIndex >= 1) {
            const tabId = this.tabHistory[tabIndex - 1];
            for (let i = 0; i < this.tabs.length; i ++) {
                if (tabId === this.tabs[i].template_key) {
                    return tabId;
                }
            }
            return 'overview';
        } else {
            return 'overview';
        }
    }

    getNextTab() {
        const currentTab = this.getCurrentTab();
        const tabIndex = this.tabHistory.lastIndexOf(currentTab);
        if (tabIndex < this.tabHistory.length - 1) {
            return this.tabHistory[tabIndex + 1];
        } else {
            return 'overview';
        }
    }

    getCurrentTab() {
        if (this.tabsChild && this.tabsChild.activeId) {
            return this.tabsChild.activeId;
        } else {
            return 'overview';
        }
    }

    updateHistory() {
        this.tabHistory.push(this.getCurrentTab());
    }

    getDuration() {
        return this.event['value'] || moment().diff(this.event['date'], 'seconds');
    }

    getMessage(event) {
        if (event['data'] && event['data']['@error']) {
            const message = this.errorService.getTargetInfoMessage(event['data']['@error']);
            if (message) {
                return message;
            }
        }

        return event['message'];
    }

    getLocation(event) {
        const location = event['data'] ? event['data']['@location'] : null;
        if (!location) {
            return;
        }

        return [location['locality'], location['level1'], location['country']]
            .filter(function(value) { return value && value.length; })
            .reduce(function(a, b, index) {
                a += (index > 0 ? ', ' : '') + b;
                return a;
            }, '');
    }

    async getEvent() {
        const optionsCallback = (options) => {
            if (options['filter']) {
                options['filter'] += ' stack:current';
            } else {
                options['filter'] = 'stack:current';
            }

            return options;
        };

        const onSuccess = (response, link) => {
            const getErrorType = (event) => {
                const error = event['data'] && event['data']['@error'];
                if (error) {
                    const type = this.errorService.getTargetInfoExceptionType(error);
                    return type || error['type'] || 'Unknown';
                }

                const simpleError = event['data'] && event['data']['@simple_error'];
                return (simpleError && simpleError['type']) ? simpleError['type'] : 'Unknown';
            };

            this.event = JSON.parse(JSON.stringify(response.body));
            this.event_json = JSON.stringify(this.event);
            this.sessionEvents['relativeTo'] = this.event['date'];
            this.event['errorType'] = getErrorType(this.event);
            this.event['environment'] = this.event['data'] && this.event['data']['@environment'];
            this.location = this.getLocation(this.event);
            this.event['message'] = this.getMessage(this.event);
            this.hasError = this.event['data'] && (this.event['data']['@error'] || this.event['data']['@simple_error']);
            this.isSessionStart = this.event['type'] === 'session';
            this.level = this.event['data'] && !!this.event['data']['@level'] ? this.event['data']['@level'].toLowerCase() : null;
            this.isLevelSuccess = this.level === 'trace' || this.level === 'debug';
            this.isLevelInfo = this.level === 'info';
            this.isLevelWarning = this.level === 'warn';
            this.isLevelError = this.level === 'error';

            this.event['request'] = this.event['data'] && this.event['data']['@request'];
            this.hasCookies = this.event['request'] && !!this.event['request']['cookies'] && Object.keys(this.event['request']['cookies']).length > 0;
            this.event['requestUrl'] = this.event['request'] && this.urlService.buildUrl(this.event['request']['is_secure'], this.event['request'].host, this.event['request'].port, this.event['request'].path, this.event['request'].query_string);

            this.event['user'] = this.event['data'] && this.event['data']['@user'];
            this.event['userIdentity'] = this.event['user'] && this.event['user']['identity'];
            this.event['userName'] = this.event['user'] && this.event['user']['name'];

            this.event['userDescription'] = this.event['data'] && this.event['data']['@user_description'];
            this.event['userEmail'] = this.event['userDescription'] && this.event['userDescription']['email_address'];
            this.event['userDescription'] = this.event['userDescription'] && this.event['userDescription']['description'];
            this.event['version'] = this.event['data'] && this.event['data']['@version'];

            const links = this.linkService.getLinks(link);
            this.previous = links['previous'] ? links['previous'].split('/').pop() : null;
            this.next = links['next'] ? links['next'].split('/').pop() : null;

            this.addHotKeys();
            this.buildReferences();

            return this.event;
        };

        const onFailure = (response?) => {
            if (response && response.status === 426) {
                try {
                    return this.billingService.confirmUpgradePlan(this.viewRef, response.error.message, this.project['organization_id'], () => {
                        return this.getEvent();
                    });
                } catch (err) {
                    this.router.navigate(['/type/events/dashboard']);
                }
            }

            this.router.navigate(['/type/events/dashboard']);
            this.notificationService.error('Failed!', 'Cannot_Find_Event');
        };

        if (!this.eventId) {
            onFailure();
        }

        try {
            const res = await this.eventService.getById(this.eventId, {}, optionsCallback);
            onSuccess(res, res.headers.get('link'));
            return res;
        } catch (err) {
            onFailure(err);
            return err;
        }
    }

    async getProject() {
        const onSuccess = (response) => {
            this.project = JSON.parse(JSON.stringify(response));
            this.project['promoted_tabs'] = this.project['promoted_tabs'] || [];

            return this.project;
        };

        const onFailure = () => {
            this.router.navigate(['/type/events/dashboard']);
        };

        if (!this.event || !this.event['project_id']) {
            onFailure();
        }

        try {
            const res = await this.projectService.getById(this.event['project_id']);
            onSuccess(res);
            return res;
        } catch (err) {
            onFailure();
            return err;
        }
    }

    isPromoted(tabName) {
        if (!this.project || !this.project['promoted_tabs']) {
            return false;
        }

        return this.project['promoted_tabs'].filter(function (tab) { return tab === tabName; }).length > 0;
    }

    async promoteTab(tabName) {

        $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab`)
            .setProperty('id', this.eventId)
            .setProperty('TabName', tabName)
            .submit();

        try {
            await this.projectService.promoteTab(this.project['id'], tabName);

            $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab.success`)
                .setProperty('id', this.eventId)
                .setProperty('TabName', tabName)
                .submit();

            this.project['promoted_tabs'].push(tabName);
            this.buildTabs(tabName);
        } catch (err) {
            $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab.error`)
                .setProperty('id', this.eventId)
                .setProperty('response', err)
                .setProperty('TabName', tabName)
                .submit();
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred promoting tab.'));
        }
    }
}
