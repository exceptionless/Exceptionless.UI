import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AuthService } from "ng2-ui-auth";
import { Router } from "@angular/router";
import { NotificationService } from "../../../service/notification.service";
import { UserService } from "../../../service/user.service";
import { WordTranslateService } from "../../../service/word-translate.service";
import { AppEventService } from "../../../service/app-event.service";
import { Intercom } from "ng-intercom";
import { FilterStoreService } from "../../../service/filter-store.service";
import { CurrentUser } from "src/app/models/user";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    @Output() navigationCollapseToggle: EventEmitter<null> = new EventEmitter();
    @Output() showResponsiveSideToggle: EventEmitter<null> = new EventEmitter();
    @Output() showResponsiveNavToggle: EventEmitter<null> = new EventEmitter();

    public user: CurrentUser;
    public gravatarStyle = {
        "border-style": "solid",
        "border-color": "#ddd",
        "border-radius": "4px",
        "border-width": "0px"
    };

    constructor(
        private auth: AuthService,
        private router: Router,
        private notificationService: NotificationService,
        private userService: UserService,
        private wordTranslateService: WordTranslateService,
        private appEvent: AppEventService,
        private intercom: Intercom,
        private filterStoreService: FilterStoreService
    ) {}

    public async ngOnInit() {
        await this.getUser();
    }

    public toggleSideNavCollapsed() {
        this.navigationCollapseToggle.emit(null);
    }

    public toggleResponsiveSide() {
        this.showResponsiveSideToggle.emit(null);
    }

    public toggleResponsiveNav() {
        this.showResponsiveNavToggle.emit(null);
    }

    public async logout() {
        try {
            await this.auth.logout().toPromise();
            this.filterStoreService.removeProjectName();
            this.router.navigate(["/login"]);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        }
    }

    private async getUser() {
        try {
            this.user = await this.userService.getCurrentUser();
            // this.appEvent.fireEvent({type: "UPDATE_USER"}); // TODO: Why is this here.
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        }
    }

    public canChangePlan(): boolean {
        return !!environment.STRIPE_PUBLISHABLE_KEY;
    }

    public isIntercomEnabled(): boolean {
        return !!environment.INTERCOM_APPID;
    }

    public showIntercom() {
        this.intercom.showNewMessage();
    }
}
