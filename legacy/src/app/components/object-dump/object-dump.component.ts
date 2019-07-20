import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-object-dump",
    templateUrl: "./object-dump.component.html",
    styleUrls: ["./object-dump.component.less"]
})

export class ObjectDumpComponent implements OnInit {
    @Input() public content: object;
    public keys: string[];

    constructor() {}

    public ngOnInit() {
        this.keys = this.content ? Object.keys(this.content) : [];
    }
}
