import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-project-filter',
    templateUrl: './project-filter.component.html',
    styleUrls: ['./project-filter.component.less']
})
export class ProjectFilterComponent implements OnInit {
    opened: boolean = false;

    constructor() {
    }

    ngOnInit() {
    }

    toggleOpen() {
        this.opened = !this.opened
    }
}
