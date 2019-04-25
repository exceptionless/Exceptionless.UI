import {Component, OnInit, Input} from "@angular/core";
import * as moment from "moment";

@Component({
    selector: "app-relative-time",
    templateUrl: "./relative-time.component.html"
})

export class RelativeTimeComponent implements OnInit {
    @Input() public date: Date;
    @Input() public to: Date;
    public text: string;

    constructor() {}

    public ngOnInit() {
        this.setRelativeTimeText();
    }

    public setRelativeTimeText() {
        const to = moment(this.to);
        const date = moment(this.date);
        const isValid = !!this.to && to.isValid() && to.year() > 1 && !!this.date && date.isValid() && date.year() > 1;
        this.text = isValid ? date.to(to, true) : "never";
    }
}
