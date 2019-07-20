import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { NotificationService } from "../../../../service/notification.service";
import { WordTranslateService } from "../../../../service/word-translate.service";
import { ClipboardService } from "ngx-clipboard";

@Component({
    selector: "app-extended-data-item",
    templateUrl: "./extended-data-item.component.html"
})

export class ExtendedDataItemComponent implements OnInit {
    @Input() public title: string;
    @Input() public data;
    @Input() public isPromoted: boolean;
    @Input() public showOptions: boolean = true;
    @Output() public promoteTabParam = new EventEmitter<string>();
    @Output() public demoteTabParam = new EventEmitter<string>();
    public showRaw: boolean = false;
    public clipboardSupported: boolean = this.clipboardService.isSupported;

    constructor(
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private clipboardService: ClipboardService,
    ) {}

    public ngOnInit() {
    }

    public async copied() {
        this.notificationService.success("", await this.wordTranslateService.translate("Copied!"));
    }

    public demoteTab() {
        this.demoteTabParam.emit(this.title);
    }

    public hasData() {
        return typeof this.data !== "undefined" && Object.keys(this.data).length !== 0;
    }

    // TODO: See why this isn't being used.
    private getData(data, exclusions) {
        const toSpacedWords = (value) => {
            value = value.replace(/_/g, " ").replace(/\s+/g, " ").trim();
            value = value.replace(/([a-z0-9])([A-Z0-9])/g, "$1 $2");
            return value.length > 1 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        };

        exclusions = exclusions && exclusions.length ? exclusions : [];

        if (typeof data !== "object" || !(data instanceof Object)) {
            return data;
        }

        return Object.keys(data)
            .filter(value => value && value.length && exclusions.indexOf(value) < 0)
            .map(value => ({ key: value, name: toSpacedWords(value) }))
            .sort((a, b) => a.name - b.name)
            .reduce((a, b) => {
                a[b.name] = data[b.key];
                return a;
            }, {});
    }

    private getType() {
        return typeof this.data;
    }

    public promoteTab() {
        this.promoteTabParam.emit(this.title);
    }
}
