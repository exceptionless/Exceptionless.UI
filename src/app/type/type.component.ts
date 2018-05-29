import {Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

import { HeaderComponent } from './includes/header/header.component';

@Component({
    selector: 'app-type',
    templateUrl: './type.component.html',
    styleUrls: ['./type.component.css']
})

export class TypeComponent implements OnInit {
    isSideNavCollapsed: boolean = false;

    constructor() {
    }

    ngOnInit() {
    }

    onToggleSideNavCollapsed(): void {
        this.isSideNavCollapsed = !this.isSideNavCollapsed;
    }
}
