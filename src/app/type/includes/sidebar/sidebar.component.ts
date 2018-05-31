import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    types: object;
    actions: object;

    constructor() {
        this.types = {
            exceptions: 'error',
            log: 'log',
            broken: '404',
            feature: 'usage',
            events: 'events'
        };

        this.actions = {
            list: 'list',
            edit: 'edit'
        };
    }

    ngOnInit() {
    }

}
