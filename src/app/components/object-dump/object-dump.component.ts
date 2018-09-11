import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-object-dump',
    templateUrl: './object-dump.component.html',
    styleUrls: ['./object-dump.component.less']
})

export class ObjectDumpComponent implements OnInit {

    @Input() content;
    keys: any[];

    constructor() {
    }

    ngOnInit() {
        this.keys = Object.keys(this.content);
    }
}
