import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    types: object;
    panel: object;

    constructor() {
        this.types = {
            exceptions: 'error',
            log: 'log',
            broken: '404',
            feature: 'usage',
            events: 'events',
        };

        this.panel = {
            dashboard: 'dashboard',
            recent: 'recent',
            frequent: 'frequent',
            users: 'users',
            new: 'new',
        }
    }

    ngOnInit() {
    }

}
