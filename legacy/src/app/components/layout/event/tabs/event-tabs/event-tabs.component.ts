import { Component, Input, EventEmitter, Output } from "@angular/core";
import { NotificationService } from "../../../../../service/notification.service";
import { WordTranslateService } from "../../../../../service/word-translate.service";
import { ClipboardService } from "ngx-clipboard";
import { Project } from "src/app/models/project";
import { PersistentEvent } from "src/app/models/event";
import { Tab } from "../../event.component";

@Component({
    selector: "app-event-tabs",
    templateUrl: "./event-tabs.component.html"
})
export class EventTabsComponent {
    // TODO: Is there away to dynamically load tab controls how we were doing it before?
    // TODO: There are a ton of made up properties on the event that should not be there......... We need to fix all these :\
    @Input() public tab: Tab;
    @Input() public event: PersistentEvent;
    @Input() public project: Project;
    @Input() public sessionEvents: PersistentEvent[];
    @Output() public promoteTabParam = new EventEmitter<string> ();
    @Output() public demoteTabParam = new EventEmitter<string> ();
    public textStackTrace: string;
    public clipboardSupported: boolean = this.clipboardService.isSupported;

    constructor(
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private clipboardService: ClipboardService
    ) {}

    public tabPromote(tabName: string) {
        this.promoteTabParam.emit(tabName);
    }

    public tabDemote(tabName: string) {
        this.demoteTabParam.emit(tabName);
    }

    public isPromotedTab() {
        return this.tab.template_key.indexOf("promoted") >= 0;
    }

    public async copied() {
        this.notificationService.success("", await  this.wordTranslateService.translate("Copied!"));
    }
}
