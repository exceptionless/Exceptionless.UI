import {Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-type',
    templateUrl: './type.component.html',
    styleUrls: ['./type.component.css']
})

export class TypeComponent implements OnInit {
    isSideNavCollapsed = false;

    constructor() {
    }

    ngOnInit() {
    }

    onToggleSideNavCollapsed(): void {
        this.isSideNavCollapsed = !this.isSideNavCollapsed;
    }
}
