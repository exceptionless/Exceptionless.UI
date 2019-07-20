import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-value-dump",
    templateUrl: "./value-dump.component.html",
    styleUrls: ["./value-dump.component.less"]
})
export class ValueDumpComponent implements OnInit {
    @Input() public content: any;
    @Input() public isRoot: boolean;

    public contentType: string;
    public _isArray: boolean;

    constructor() {
        this._isArray = false;
    }

    public ngOnInit() {
        this.contentType = this.getType();
        this._isArray = this.isArray();
    }

    private getType() {
        return typeof this.content;
    }

    private isArray() {
        return Array.isArray(this.content);
    }
}
