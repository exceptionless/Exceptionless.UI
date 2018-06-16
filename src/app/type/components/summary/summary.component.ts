import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.less']
})

export class SummaryComponent implements OnInit {
    @Input() source;
    @Input() showType;

    templateUrl: string = '';
    isLevelSuccess: any;
    isLevelInfo: any;
    isLevelWarning: any;
    isLevelError: any;

    constructor() {
    }

    ngOnInit() {
        let level =  this.source && this.data && this.source.data.Level ? this.source.data.Level.toLowerCase() : null;
        this.isLevelSuccess = level === 'trace' || level === 'debug';
        this.isLevelInfo = level === 'info';
        this.isLevelWarning = level === 'warn';
        this.isLevelError = level === 'error';

        this.templateUrl = './templates/' + this.source.template_key + '.html';
    }
}
