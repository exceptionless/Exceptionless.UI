import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HotkeysService, Hotkey } from "angular2-hotkeys";
import { ClipboardService } from "ngx-clipboard";
import * as moment from "moment";
import { BillingService } from "../../../service/billing.service";
import { ErrorService } from "../../../service/error.service";
import { EventService } from "../../../service/event.service";
import { FilterService } from "../../../service/filter.service";
import { LinkService } from "../../../service/link.service";
import { NotificationService } from "../../../service/notification.service";
import { ProjectService } from "../../../service/project.service";
import { WordTranslateService } from "../../../service/word-translate.service";
import { NgbTabset } from "@ng-bootstrap/ng-bootstrap";
import { $ExceptionlessClient } from "../../../exceptionlessclient";
import { UrlService } from "../../../service/url.service";
import { PersistentEvent } from "src/app/models/event";
import { Project } from "src/app/models/project";
import { Subscription } from "rxjs";
import { EntityChanged } from "src/app/models/messaging";

export interface Tab {
    active: boolean;
    index: number;
    title: string;
    template_key: string;
    data: any;
}

@Component({
    selector: "app-event",
    templateUrl: "./event.component.html"
})

export class EventComponent implements OnInit, OnDestroy {
    private _source: string = "app.event.Event";
    private eventId: string;
    private _knownDataKeys: string[] = ["error", "@error", "@simple_error", "@request", "@trace", "@environment", "@user", "@user_description", "@version", "@level", "@location", "@submission_method", "@submission_client", "session_id", "sessionend", "haserror", "@stack"];
    private activeTabIndex: number = -1;
    public event: PersistentEvent;
    public eventJson: string;
    textStackTrace: string; // TODO: All these properties without a modifier I believe are being used in the event tabs component... need to verify how this is being passed through..
    excludedAdditionalData: string[] = ["@browser", "@browser_version", "@browser_major_version", "@device", "@os", "@os_version", "@os_major_version", "@is_bot"];
    location: string;
    isSessionStart: boolean = false;
    level: string;
    isLevelSuccess: boolean = false;
    isLevelInfo: boolean = false;
    isLevelWarning: boolean = false;
    isLevelError: boolean = false;
    hasCookies: boolean = false;
    hasError: boolean = false;
    version: string;
    references: { id: string, name: string }[] = [];

    public project: Project;
    public sessionEvents = {
        get: (options, event?) => {
            let curEvent = event;
            if (!curEvent) {
                curEvent = this.event;
            }
            const optionsCallback = (option) => {
                option.filter = "-type:heartbeat";

                const start = moment.utc(curEvent.date).local();
                const end = (curEvent.data && curEvent.data.sessionend) ? moment.utc(curEvent.data.sessionend).add(1, "seconds").local().format("YYYY-MM-DDTHH:mm:ss") : "now";
                option.time = start.format("YYYY-MM-DDTHH:mm:ss") + "-" + end;
                return option;
            };

            const serialize = (obj) => {
                const str = [];
                for (const p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                }
                return str.join("&");
            };

            let requestOptions: any = this.filterService.getDefaultOptions(false);
            Object.assign(requestOptions, optionsCallback(options));
            requestOptions = serialize(requestOptions);
            return this.eventService.getBySessionId(curEvent.project_id, curEvent.reference_id, requestOptions);
        },
        options: {
            limit: 10,
            mode: "summary"
        },
        timeHeaderText: "Session Time",
        hideActions: true,
        hideSessionStartTime: true
    };
    public tabs: Tab[] = [];
    public activeTab: string = "overview";
    private tabHistory: string[] = [];
    public previous: any;
    public next: any;
    public clipboardSupported: boolean = this.clipboardService.isSupported;
    private subscriptions: Subscription[];
    @ViewChild("tabsChild") tabsChild: NgbTabset;

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

    public ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.activatedRoute.params.subscribe(async params => {
            if (this.eventId !== params.id) {
                this.eventId = params.id;
                await this.get();
            }
        }));

        // this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
        //     this.activateTab(params['tab']);
        // }));
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    private async get() {
        try {
            await this.getEvent();
            await this.getProject();
            await this.buildTabs(this.activeTab);
        } catch (ex) {}
    }

    private addHotKeys() {
        if (this.event.stack_id) {
            this.hotkeysService.add(new Hotkey("mod+up", (event: KeyboardEvent): boolean => {
                $ExceptionlessClient.createFeatureUsage(`${this._source}.hotkeys.GoToStack`)
                    .addTags("hotkeys")
                    .setProperty("id", this.eventId)
                    .submit();
                this.router.navigate([`/type/event/${this.eventId}`]);
                return false;
            }));

            if (this.clipboardService.isSupported) {
                this.hotkeysService.add(new Hotkey("mod+shift+c", (event: KeyboardEvent): boolean => {
                    $ExceptionlessClient.createFeatureUsage(`${this._source}.hotkeys.CopyEventJSON`)
                        .addTags("hotkeys")
                        .setProperty("id", this.eventId)
                        .submit();
                    this.clipboardService.copyFromContent(this.eventJson);
                    return false;
                }));
            }
        }

        if (this.previous) {
            this.hotkeysService.add(new Hotkey("mod+left", (event: KeyboardEvent): boolean => {
                $ExceptionlessClient.createFeatureUsage(`${this._source}.hotkeys.PreviousOccurrence`)
                    .addTags("hotkeys")
                    .setProperty("id", this.eventId)
                    .submit();
                this.router.navigate([`/type/event/${this.previous}`], { queryParams: { tab: this.getCurrentTab() } });
                return false;
            }));
        }

        if (this.next) {
            this.hotkeysService.add(new Hotkey("mod+left", (event: KeyboardEvent): boolean => {
                $ExceptionlessClient.createFeatureUsage(`${this._source}.hotkeys.NextOccurrence`)
                    .addTags("hotkeys")
                    .setProperty("id", this.eventId)
                    .submit();
                this.router.navigate([`/type/event/${this.next}`], { queryParams: { tab: this.getCurrentTab() } });
                return false;
            }));
        }
    }

    private activateTab(tabName: string) {
        if (this.tabs.length === 0) {
            return;
        }
        for (const tab of this.tabs) {
            if (tab.title !== tabName) {
                tab.active = false;
                continue;
            }

            tab.active = true;
            this.activeTabIndex = tab.index;
            this.activeTab = tab.template_key;
            break;
        }

        if (this.activeTabIndex < 0 || this.activeTabIndex >= this.tabs.length) {
            this.tabs[0].active = true;
            this.activeTabIndex = 0;
            this.activeTab = this.tabs[0].template_key;
        }
    }

    private buildReferences() {
        const toSpacedWords = (value) => {
            value = value.replace(/_/g, " ").replace(/\s+/g, " ").trim();
            value = value.replace(/([a-z0-9])([A-Z0-9])/g, "$1 $2");
            return value.length > 1 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        };

        this.references = [];
        const referencePrefix = "@ref:";

        Object.keys(this.event.data).map((key) => {
            if (key.startsWith(referencePrefix)) {
                this.references.push({ id: this.event.data[key], name: toSpacedWords(key.slice(5)) });
            }
        });
    }

    private buildTabs(tabNameToActivate: string) {
        let tabIndex = 0;
        let promotedIndex = 0;
        let tabs: Array<{index: number, title: string, template_key: string, data?: any}> = [];
        tabs = [{index: tabIndex, title: "Overview", template_key: "overview"}];

        if (this.event.reference_id && this.isSessionStart) {
            tabs.push({index: ++tabIndex, title: "Session Events", template_key: "session"});
        }

        if (this.event.data && this.event.data["@error"]) {
            tabs.push({index: ++tabIndex, title: "Exception", template_key: "error"});
        } else if (this.event.data && this.event.data["@simple_error"]) {
            tabs.push({index: ++tabIndex, title: "Exception", template_key: "simple-error"});
        }

        // TODO: A bunch of made up properties..
        if (this.event.request && Object.keys(this.event.request).length > 0) {
            tabs.push({index: ++tabIndex, title: this.isSessionStart ? "Browser" : "Request", template_key: "request"});
        }

        if (this.event.environment && Object.keys(this.event.environment).length > 0) {
            console.log("event-environment");
            console.log(this.event.environment);
            tabs.push({index: ++tabIndex, title: "Environment", template_key: "environment"});
        }

        const extendedDataItems = [];

        Object.keys(this.event.data).map((key) => {
            if (key === "@trace") {
                key = "Trace Log";
            }

            if (key.startsWith("@")) {
                return;
            }

            if (this.isPromoted(key)) {
                tabs.push({index: ++tabIndex, title: key, template_key: "promoted-" + promotedIndex, data: this.event.data[key]});
                promotedIndex ++;
            } else if (this._knownDataKeys.indexOf(key) < 0) {
                extendedDataItems.push({title: key, data: this.event.data[key]});
            }
        });

        if (extendedDataItems.length > 0) {
            tabs.push({index: ++tabIndex, title: "Extended Data", template_key: "extended-data", data: extendedDataItems});
        }


        this.tabs = tabs;

        console.log(this.tabs);

        if (tabNameToActivate) {
            setTimeout(() => {
                this.activateTab(tabNameToActivate);
            }, 500);
        }
    }

    public canRefresh(message: EntityChanged) { // TODO: This needs to be hooked up to the can refresh.
        if (!!message && message.type === "PersistentEvent") {
            // Refresh if the event id is set (non bulk) and the deleted event matches one of the events.
            if (message.id && this.event.id) {
                return message.id === this.event.id;
            }

            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: message.organization_id, projectId: message.project_id });
        }

        if (!!message && message.type === "Stack") {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: message.organization_id, projectId: message.project_id });
        }

        if (!!message && message.type === "Organization" || message.type === "Project") {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: message.id, projectId: message.id });
        }

        return !message;
    }

    public async copied() {
        this.notificationService.success("", await  this.wordTranslateService.translate("Copied!"));
    }

    public async demoteTab(tabName: string) {
        const index = this.project.promoted_tabs.indexOf(tabName);
        if (index < 0) {
            return;
        }

        $ExceptionlessClient.createFeatureUsage(`${this._source}.demoteTab`)
            .setProperty("id", this.eventId)
            .setProperty("TabName", tabName)
            .submit();

        try {
            await this.projectService.demoteTab(this.project.id, tabName);
            $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab.success`)
                .setProperty("id", this.eventId)
                .setProperty("TabName", tabName)
                .submit();

            this.project.promoted_tabs.splice(index, 1);
            this.buildTabs("Extended Data");
        } catch (ex) {
            $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab.error`)
                .setProperty("id", this.eventId)
                .setProperty("response", ex)
                .setProperty("TabName", tabName)
                .submit();

            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred promoting tab."));
        }
    }

    public getPreviousTab() {
        const currentTab = this.getCurrentTab();
        const tabIndex = this.tabHistory.lastIndexOf(currentTab);
        if (tabIndex >= 1) {
            const tabId = this.tabHistory[tabIndex - 1];
            for (const tab of this.tabs) {
                if (tabId === tab.template_key) {
                    return tabId;
                }
            }
            return "overview";
        } else {
            return "overview";
        }
    }

    public getNextTab() {
        const currentTab = this.getCurrentTab();
        const tabIndex = this.tabHistory.lastIndexOf(currentTab);
        if (tabIndex < this.tabHistory.length - 1) {
            return this.tabHistory[tabIndex + 1];
        } else {
            return "overview";
        }
    }

    public getCurrentTab() {
        if (this.tabsChild && this.tabsChild.activeId) {
            return this.tabsChild.activeId;
        } else {
            return "overview";
        }
    }

    public updateHistory() {
        this.tabHistory.push(this.getCurrentTab());
    }

    private getDuration() {
        return this.event.value || moment().diff(this.event.date, "seconds");
    }

    private getMessage(event: PersistentEvent) {
        if (event.data && event.data["@error"]) {
            const message = this.errorService.getTargetInfoMessage(event.data["@error"]);
            if (message) {
                return message;
            }
        }

        return event.message;
    }

    private getLocation(event: PersistentEvent) {
        const location = event.data ? event.data["@location"] : null;
        if (!location) {
            return;
        }

        return [location.locality, location.level1, location.country]
            .filter(value => value && value.length)
            .reduce((a, b, index) => {
                a += (index > 0 ? ", " : "") + b;
                return a;
            }, "");
    }

    private async getEvent() {
        const optionsCallback = (options) => {
            if (options.filter) {
                options.filter += " stack:current";
            } else {
                options.filter = "stack:current";
            }

            return options;
        };

        if (!this.eventId) {
            this.router.navigate(["/type/events/dashboard"]);
            this.notificationService.error("Failed!", "Cannot_Find_Event");
        }

        try {

            const getErrorType = (event) => {
                const error = event.data && event.data["@error"];
                if (error) {
                    const type = this.errorService.getTargetInfoExceptionType(error);
                    return type || error.type || "Unknown";
                }

                const simpleError = event.data && event.data["@simple_error"];
                return (simpleError && simpleError.type) ? simpleError.type : "Unknown";
            };

            this.event = await this.eventService.getById(this.eventId, {}, optionsCallback);
            this.eventJson = JSON.stringify(this.event);
            this.sessionEvents.relativeTo = this.event.date;
            this.event.errorType = getErrorType(this.event);
            this.event.environment = this.event.data && this.event.data["@environment"]; //TODO: TONS of made up properties that should be in their own root property....
            this.event.location = this.getLocation(this.event);
            this.event.message = this.getMessage(this.event);
            this.event.hasError = this.event.data && (this.event.data["@error"] || this.event.data["@simple_error"]);
            this.isSessionStart = this.event.type === "session";
            this.level = this.event.data && !!this.event.data["@level"] ? this.event.data["@level"].toLowerCase() : null;
            this.isLevelSuccess = this.level === "trace" || this.level === "debug";
            this.isLevelInfo = this.level === "info";
            this.isLevelWarning = this.level === "warn";
            this.isLevelError = this.level === "error";

            this.request = this.event.data && this.event.data["@request"];
            this.hasCookies = this.event.request && !!this.event.request.cookies && Object.keys(this.event.request.cookies).length > 0;
            this.requestUrl = this.event.request && this.urlService.buildUrl(this.event.request.is_secure, this.event.request.host, this.event.request.port, this.event.request.path, this.event.request.query_string);

            this.user = this.event.data && this.event.data["@user"];
            this.userIdentity = this.event.user && this.event.user.identity;
            this.event.userName = this.event.user && this.event.user.name;

            this.userDescription = this.event.data && this.event.data["@user_description"];
            this.userEmail = this.event.userDescription && this.event.userDescription.email_address;
            this.userDescription = this.event.userDescription && this.event.userDescription.description;
            this.version = this.event.data && this.event.data["@version"];

            const links = this.linkService.getLinks(response.headers.get("link")); // TODO: Need to investigate the best way to get by id but also to get header values. What were we doing before?
            this.previous = links.previous ? links.previous.split("/").pop() : null;
            this.next = links.next ? links.next.split("/").pop() : null;

            this.addHotKeys();
            this.buildReferences();
        } catch (ex) {
            if (response && response.status === 426) { // TODO: Does an exception here return a status code?
                try {
                    return this.billingService.confirmUpgradePlan(this.viewRef, response.error.message, this.project.organization_id, () => {
                        return this.getEvent();
                    });
                } catch (ex) {
                    this.router.navigate(["/type/events/dashboard"]);
                }
            }

            this.router.navigate(["/type/events/dashboard"]);
            this.notificationService.error("Failed!", "Cannot_Find_Event");
        }
    }

    private async getProject() {
        if (!this.event || !this.event.project_id) {
            // TODO: what did we do before?
            this.router.navigate(["/type/events/dashboard"]);
        }

        try {
            this.project = await this.projectService.getById(this.event.project_id);
            this.project.promoted_tabs = this.project.promoted_tabs || [];
        } catch (ex) {
            // TODO: what did we do before?
            this.router.navigate(["/type/events/dashboard"]);
        }
    }

    private isPromoted(tabName): boolean {
        if (!this.project || !this.project.promoted_tabs) {
            return false;
        }

        return this.project.promoted_tabs.filter(tab => tab === tabName).length > 0;
    }

    public async promoteTab(tabName) {
        $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab`)
            .setProperty("id", this.eventId)
            .setProperty("TabName", tabName)
            .submit();

        try {
            await this.projectService.promoteTab(this.project.id, tabName);
            $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab.success`)
                .setProperty("id", this.eventId)
                .setProperty("TabName", tabName)
                .submit();

            this.project.promoted_tabs.push(tabName);
            this.buildTabs(tabName);
        } catch (ex) {
            $ExceptionlessClient.createFeatureUsage(`${this._source}.promoteTab.error`)
                .setProperty("id", this.eventId)
                .setProperty("response", ex)
                .setProperty("TabName", tabName)
                .submit();
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred promoting tab."));
        }
    }
}
