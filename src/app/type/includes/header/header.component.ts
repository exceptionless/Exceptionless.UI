import {Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
    @Output() navigationCollapseToggle: EventEmitter<any> = new EventEmitter();

    parentClass: string;

    constructor() {
    }

    ngOnInit() {
    }

    toggleSideNavCollapsed() {
        this.navigationCollapseToggle.emit(null);
    }
}
