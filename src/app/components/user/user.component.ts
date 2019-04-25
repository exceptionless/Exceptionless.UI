import { Component, OnInit, Input, ViewContainerRef, HostBinding } from "@angular/core";
import { LinkService } from "../../service/link.service";
import { NotificationService } from "../../service/notification.service";
import { OrganizationService } from "../../service/organization.service";
import { PaginationService } from "../../service/pagination.service";
import { UserService } from "../../service/user.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { DialogService } from "../../service/dialog.service";
import { User } from "src/app/models/user";

@Component({
    selector: "app-user",
    templateUrl: "./user.component.html"
})

export class UserComponent implements OnInit {
    @HostBinding("class.app-component") appComponent = true;
    @Input() public settings: any;
    public users: User[];
    public next: string;
    public previous: string;
    public pageSummary: string;
    public currentOptions: any;
    public loading: boolean = true;

    constructor(
        private viewRef: ViewContainerRef,
        private linkService: LinkService,
        private notificationService: NotificationService,
        private organizationService: OrganizationService,
        private paginationService: PaginationService,
        private userService: UserService,
        private wordTranslateService: WordTranslateService,
        private dialogService: DialogService
    ) {}

    public async ngOnInit() { // TODO: Should we be doing async here? We are in other ngOnInits
       await this.get();
    }

    private async get(options?) {
        this.currentOptions = options || this.settings.options;

        try {
            this.users = await this.settings.get(this.currentOptions).toPromise();
            const links = this.linkService.getLinksQueryParameters(res.headers.get("link"));
            this.previous = links.previous;
            this.next = links.next;

            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions.page, this.currentOptions.limit);
            if (this.users.length === 0 && this.currentOptions.page && this.currentOptions.page > 1) {
                return await this.get();
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        } finally {
            this.loading = false;
        }
    }

    public hasAdminRole(user) {
        return this.userService.hasAdminRole(user);
    }

    public hasUsers() {
        return this.users && this.users.length > 0;
    }

    public async nextPage() {
        await this.get(this.next);
    }

    public async previousPage() {
        await this.get(this.previous);
    }

    public async remove(user: User) {
        const modalCallBackFunction = async () => {
            try {
                await this.organizationService.removeUser(this.settings.organizationId, user.email_address);
                this.users.splice(this.users.indexOf(user), 1);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to remove the user."));
                throw ex;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to remove this user from your organization?", "Remove User", modalCallBackFunction);
    }

    public async resendNotification(user) {
        try {
            await this.organizationService.addUser(this.settings.organizationId, user.email_address);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to resend the notification."));
        }
    }

    public async updateAdminRole(user) {
        const message = !this.userService.hasAdminRole(user) ? "Are you sure you want to add the admin role for this user?" : "Are you sure you want to remove the admin role from this user?";
        const btnTxt = await this.wordTranslateService.translate(!this.userService.hasAdminRole(user) ? "Add" : "Remove");
        const modalCallBackFunction = async () => {
            if (!this.userService.hasAdminRole(user)) {
                try {
                    await this.userService.addAdminRole(user.id);
                    this.notificationService.success("", await this.wordTranslateService.translate("Successfully queued the user for change role."));
                } catch (ex) {
                    this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to change user role."));
                    throw ex;
                }
            }

            try {
                await this.userService.removeAdminRole(user.id);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to remove the user."));
                throw ex;
            }
        };
        this.dialogService.confirm(this.viewRef, message, btnTxt, modalCallBackFunction);
    }
}
