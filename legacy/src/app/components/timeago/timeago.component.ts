import { Component, OnInit, OnChanges, Input, SimpleChanges } from "@angular/core";
import * as moment from "moment";

@Component({
    selector: "app-timeago",
    templateUrl: "./timeago.component.html"
})

export class TimeagoComponent implements OnInit, OnChanges {
    @Input() public date: Date;
    public text: string;

    constructor() {}

    public ngOnInit() {
        this.setTimeagoText();
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.setTimeagoText();
    }

    private setTimeagoText() {
        const dateInstance = moment(this.date);
        this.text = (!!this.date && dateInstance.isValid() && dateInstance.year() > 1) ? dateInstance.fromNow() : "never";
    }
}
