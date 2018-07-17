import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-account-manage',
    templateUrl: './account-manage.component.html',
    styleUrls: ['./account-manage.component.less']
})
export class AccountManageComponent implements OnInit {
    activeTabIndex = 0;
    constructor() {
    }

    ngOnInit() {
    }

    activateTab(tabName) {
        switch (tabName) {
            case 'notifications':
                this.activeTabIndex = 1;
                break;
            case 'password':
                this.activeTabIndex = 2;
                break;
            case 'external':
                this.activeTabIndex = 3;
                break;
            default:
                this.activeTabIndex = 0;
                break;
        }
    }
}
