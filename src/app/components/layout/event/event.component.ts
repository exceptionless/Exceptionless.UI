import { Component, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-event',
    templateUrl: './event.component.html'
})

export class EventComponent implements OnInit {
    _eventId = [];
    _knownDataKeys = ['error', '@error', '@simple_error', '@request', '@trace', '@environment', '@user', '@user_description', '@version', '@level', '@location', '@submission_method', '@submission_client', 'session_id', 'sessionend', 'haserror', '@stack'];
    activeTabIndex = -1;
    event = {};
    event_json = '';
    textStackTrace = '';
    excludedAdditionalData = ['@browser', '@browser_version', '@browser_major_version', '@device', '@os', '@os_version', '@os_major_version', '@is_bot'];
    errorType = 'Unknown';
    environment = {};
    location = '';
    message = '';
    isSessionStart = false;
    level = '';
    isLevelSuccess = false;
    isLevelInfo = false;
    isLevelWarning = false;
    isLevelError = false;
    request = {};
    requestUrl = '';
    hasCookies = false;
    hasError = false;
    user = {};
    userIdentity = '';
    userName = '';
    userEmail = '';
    userDescription = '';
    version = '';
    project = {};
    references = [];
    sessionEvents = {
        get: (options) => {
            const optionsCallback = (option) => {
                option.filter = '-type:heartbeat';

                const start = moment.utc(this.event['date']).local();
                const end = (this.event['data'] && this.event['data']['sessionend']) ? moment.utc(this.event['data']['sessionend']).add(1, 'seconds').local().format('YYYY-MM-DDTHH:mm:ss') : 'now';
                option.time = start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end;
                return option;
            };

            return this.eventService.getBySessionId(this.event['project_id'], this.event['reference_id'], options, optionsCallback(options));
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
    tab = '';
    previous = '';
    next = '';
    clipboardSupported = this.clipboardService.isSupported;
    template: any;
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
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this._eventId = params['id'];
        });
        this.tab = this.activatedRoute.snapshot.queryParams['tab'];
    }

    ngOnInit() {
        this.get();
    }

    get() {
        this.getEvent().then(() => { this.getProject().then(() => { this.buildTabs(this.tab); } ); });
    }

    addHotKeys() {
        if (this.event['stack_id']) {
            this.hotkeysService.add(new Hotkey('mod+up', (event: KeyboardEvent): boolean => {
                this.router.navigate([`/type/event/${this._eventId}`]);
                return false;
            }));

            if (this.clipboardService.isSupported) {
                this.hotkeysService.add(new Hotkey('mod+shift+c', (event: KeyboardEvent): boolean => {
                    this.clipboardService.copyFromContent(this.event_json);
                    return false;
                }));
            }
        }

        if (this.previous) {
            this.hotkeysService.add(new Hotkey('mod+left', (event: KeyboardEvent): boolean => {
                this.router.navigate([`/type/event/${this.previous}`], { queryParams: { tab: this.getCurrentTab() } });
                return false;
            }));
        }

        if (this.next) {
            this.hotkeysService.add(new Hotkey('mod+left', (event: KeyboardEvent): boolean => {
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
            break;
        }

        if (this.activeTabIndex < 0 || this.activeTabIndex >= this.tabs.length) {
            this.tabs[0].active = true;
            this.activeTabIndex = 0;
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

        if (this.request && Object.keys(this.request).length > 0) {
            tabs.push({index: ++tabIndex, title: this.isSessionStart ? 'Browser' : 'Request', template_key: 'request'});
        }

        if (this.environment && Object.keys(this.environment).length > 0) {
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
                this.tabs.push({index: ++tabIndex, title: key, template_key: 'promoted', data: this.event['data'][key]});
            } else if (this._knownDataKeys.indexOf(key) < 0) {
                extendedDataItems.push({title: key, data: this.event['data'][key]});
            }
        });

        if (extendedDataItems.length > 0) {
            tabs.push({index: ++tabIndex, title: 'Extended Data', template_key: 'extended-data', data: extendedDataItems});
        }

        this.tabs = tabs;
        /*$timeout(function() { activateTab(tabNameToActivate); }, 1);*/
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

    copied() {
        this.notificationService.success('Success!', 'Successfully Copied');
    }

    demoteTab(tabName) {
        const onSuccess = () => {
            this.project['promoted_tabs'].splice(indexOf, 1);
            this.buildTabs('Extended Data');
        };

        const onFailure = (response) => {
            this.notificationService.error('Failed!', 'An error occurred promoting tab.');
        };

        const indexOf = this.project['promoted_tabs'].indexOf(tabName);
        if (indexOf < 0) {
            return;
        }

        return this.projectService.demoteTab(this.project['id'], tabName).subscribe(
            res => {
                onSuccess();
            },
            err => {
                onFailure(err);
            }
        );
    }

    getCurrentTab() {
        if (this.tabs.length === 0) {
            const tab = this.tabs.filter(function(t) { return t['index'] === this.activeTabIndex; })[0];
            return tab && tab['index'] > 0 ? tab['title'] : 'Overview';
        } else {
            return 'Overview';
        }
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

    getEvent() {
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
            this.errorType = getErrorType(this.event);
            this.environment = this.event['data'] && this.event['data']['@environment'];
            this.location = this.getLocation(this.event);
            this.message = this.getMessage(this.event);
            this.hasError = this.event['data'] && (this.event['data']['@error'] || this.event['data']['@simple_error']);
            this.isSessionStart = this.event['type'] === 'session';
            this.level = this.event['data'] && !!this.event['data']['@level'] ? this.event['data']['@level'].toLowerCase() : null;
            this.isLevelSuccess = this.level === 'trace' || this.level === 'debug';
            this.isLevelInfo = this.level === 'info';
            this.isLevelWarning = this.level === 'warn';
            this.isLevelError = this.level === 'error';

            this.request = this.event['data'] && this.event['data']['@request'];
            this.hasCookies = this.request && !!this.request['cookies'] && Object.keys(this.request['cookies']).length > 0;
            /*this.requestUrl = this.request && this.urlService.buildUrl(this.request.is_secure, this.request.host, this.request.port, this.request.path, this.request.query_string);*/

            this.user = this.event['data'] && this.event['data']['@user'];
            this.userIdentity = this.user && this.user['identity'];
            this.userName = this.user && this.user['name'];

            this.userDescription = this.event['data'] && this.event['data']['@user_description'];
            this.userEmail = this.userDescription && this.userDescription['email_address'];
            this.userDescription = this.userDescription && this.userDescription['description'];
            this.version = this.event['data'] && this.event['data']['@version'];

            const links = this.linkService.getLinks(link);
            this.previous = links['previous'] ? links['previous'].split('/').pop() : null;
            this.next = links['next'] ? links['next'].split('/').pop() : null;

            this.addHotKeys();
            this.buildReferences();

            return this.event;
        };

        const onFailure = (response?) => {
            if (response && response.status === 426) {
                /*return billingService.confirmUpgradePlan(response.data.message).then(function () {
                        return getEvent();
                    }, function () {
                        $state.go('app.dashboard');
                    }
                );*/
            }

            this.router.navigate(['/type/events/dashboard']);
            this.notificationService.error('Failed!', 'Cannot_Find_Event');
        };

        if (!this._eventId) {
            onFailure();
        }

        return new Promise((resolve, reject) => {
            this.eventService.getById(this._eventId, {}, optionsCallback).subscribe(
                res => {
                    onSuccess(res, res.headers.get('link'));
                    resolve(res);
                },
                err => {
                    onFailure(err);
                    reject(err);
                }
            );
        });
    }

    getProject() {
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

        return new Promise((resolve, reject) => {
            this.projectService.getById(this.event['project_id']).subscribe(
                res => {
                    onSuccess(res);
                    resolve(res);
                },
                err => {
                    onFailure();
                    reject(err);
                }
            );
        });
    }

    isPromoted(tabName) {
        if (!this.project || !this.project['promoted_tabs']) {
            return false;
        }

        return this.project['promoted_tabs'].filter(function (tab) { return tab === tabName; }).length > 0;
    }

    promoteTab(tabName) {
        return this.projectService.promoteTab(this.project['id'], tabName).subscribe(
            res => {
                this.project['promoted_tabs'].push(tabName);
                this.buildTabs(tabName);
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred promoting tab.');
            }
        );
    }
}
