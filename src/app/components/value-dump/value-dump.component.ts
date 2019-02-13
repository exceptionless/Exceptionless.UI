import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-value-dump',
    templateUrl: './value-dump.component.html',
    styleUrls: ['./value-dump.component.less']
})
export class ValueDumpComponent implements OnInit {

    @Input() content;
    @Input() isRoot;

    contentType: any;
    _isArray: any;

    constructor() {
        this._isArray = false;
    }

    ngOnInit() {
        this.contentType = this.getType();
        this._isArray = this.isArray();
    }

    getType() {
        return typeof this.content;
    }

    isArray() {
        return Array.isArray(this.content);
    }
}
