import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-array-dump",
    templateUrl: "./array-dump.component.html",
    styleUrls: ["./array-dump.component.less"]
})
export class ArrayDumpComponent implements OnInit {

    @Input() content;

    constructor() {
    }

    public ngOnInit() {
    }
}
