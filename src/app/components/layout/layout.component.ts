import { Component, OnInit } from "@angular/core";
import { WebsocketService } from "../../service/websocket.service";
import { Router, NavigationEnd } from "@angular/router";
import { StatusService } from "../../service/status.service";
import { AboutResult } from "src/app/models/network";

@Component({
    selector: "app-layout",
    templateUrl: "./layout.component.html"
})
export class LayoutComponent implements OnInit {
    isSideNavCollapsed = false;
    isShowResponsiveSide = false;
    isShowResponsiveNav = false;
    versionNumber = "@@version"; // TODO: Ensure the version number is being replaced as part of the build.
    apiVersionNumber = "@@version";

    constructor(
        private websocketService: WebsocketService,
        private router: Router,
        private statusService: StatusService
    ) {
        this.router.events.subscribe((val) => {
            if ((val instanceof NavigationEnd) && this.router.url === "/") {
                this.router.navigate(["/dashboard"]);
            }
        });
    }

    public async ngOnInit() {
        this.websocketService.startDelayed(1000);
        await this.getServerVersionNumber(); // TODO: I'm not sure if we want to await this, but it seems like a good idea to always await if async
    }

    public async getServerVersionNumber() {
        try {
            const result: AboutResult = await this.statusService.get();
            this.apiVersionNumber = result.informational_version.split("+")[0];
        } catch (ex) {
            debugger;
        }
    }

    public onToggleSideNavCollapsed(): void {
        this.isSideNavCollapsed = !this.isSideNavCollapsed;
    }

    public onShowResponsiveSide(): void {
        this.isShowResponsiveSide = !this.isShowResponsiveSide;
    }

    public onShowResponsiveNav(): void {
        this.isShowResponsiveNav = !this.isShowResponsiveNav;
    }

    public hideSideBar() {
        this.isShowResponsiveSide = !this.isShowResponsiveSide;
    }
}
