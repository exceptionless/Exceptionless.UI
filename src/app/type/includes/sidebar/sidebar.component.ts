import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    types = {
        exceptions: 'error',
        log: 'log',
        broken: '404',
        feature: 'usage',
        events: 'events'
    };
    actions = {
        list: 'list',
        edit: 'edit'
    };

    constructor() {
    }

    ngOnInit() {
    }

}
