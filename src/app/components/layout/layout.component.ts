import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../service/websocket.service';
import { Router, NavigationEnd } from '@angular/router';
import { StatusService } from '../../service/status.service';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html'
})

export class LayoutComponent implements OnInit {
    isSideNavCollapsed = false;
    isShowResponsiveSide = false;
    isShowResponsiveNav = false;
    versionNo = '';

    constructor(
        private websocketService: WebsocketService,
        private router: Router,
        private statusService: StatusService
    ) {
        this.router.events.subscribe((val) => {
            if ((val instanceof NavigationEnd) && this.router.url === '/') {
                this.router.navigate(['/dashboard']);
            }
        });
    }

    ngOnInit() {
        this.websocketService.startDelayed(1000);
        this.getVersionNo();
    }

    async getVersionNo() {
        try {
            const res = await this.statusService.get();
            this.versionNo = res['informational_version'];
        } catch (err) {
            console.log(err);
        }
    }

    onToggleSideNavCollapsed(): void {
        this.isSideNavCollapsed = !this.isSideNavCollapsed;
    }

    onShowResponsiveSide(): void {
        this.isShowResponsiveSide = !this.isShowResponsiveSide;
    }

    onShowResponsiveNav(): void {
        this.isShowResponsiveNav = !this.isShowResponsiveNav;
    }

    hideSideBar() {
        this.isShowResponsiveSide = !this.isShowResponsiveSide;
    }
}
