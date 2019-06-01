import { Component, OnInit, ViewContainerRef, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { AuthService } from "ng2-ui-auth";
import { NotificationService } from "../../service/notification.service";
import { AuthAccountService } from "../../service/auth-account.service";
import { ProjectService } from "../../service/project.service";
import { UserService } from "../../service/user.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { BillingService } from "../../service/billing.service";
import { DialogService } from "../../service/dialog.service";
import { Project, NotificationSettings } from "src/app/models/project";
import { ChangePasswordModel } from "src/app/models/auth";
import { CurrentUser, User, OAuthAccount } from "src/app/models/user";
import { EntityChanged, ChangeType } from "src/app/models/messaging";

@Component({
    selector: "app-account-manage",
    templateUrl: "./account-manage.component.html"
})
export class AccountManageComponent implements OnInit {
    private _canSaveEmailAddress: boolean = true;
    private _projectId: string = "";

    public activeTab: string = "general";
    public confirmPassword: string | any;
    public password: ChangePasswordModel = new ChangePasswordModel();
    public emailNotificationSettings: NotificationSettings;
    public currentProject: Project;
    public user: CurrentUser;
    public projects: Project[];
    public organizationNames: string[];
    public hasPremiumFeatures: boolean = false;
    public hasLocalAccount: boolean = false;
    public emailUnique: boolean = true;
    public gravatarStyle = {
        "border-style": "solid",
        "border-color": "#ddd"
    };

    public submitted: boolean = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private authAccountService: AuthAccountService,
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private userService: UserService,
        private viewRef: ViewContainerRef,
        private wordTranslateService: WordTranslateService,
        private billingService: BillingService,
        private dialogService: DialogService
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            this.activeTab = params.tab || "general";
            this._projectId = params.projectId;
        });
    }

    public async ngOnInit() {
        await this.get();
    }

    public filterProject(organizationName: string) {
        return this.projects.filter(p =>  p.organization_name === organizationName);
    }

    public async authenticate(provider: string) {
        try {
            await this.authService.authenticate(provider).toPromise();
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while adding external login.");
            this.notificationService.error("", message);
        }
    }

    public async changePassword(form: NgForm) {
        if (!form.valid) {
            return;
        }

        this.submitted = true;

        try  {
            await this.authAccountService.changePassword(this.password);
            this.notificationService.success("", await this.wordTranslateService.translate("You have successfully changed your password."));
            this.password = new ChangePasswordModel();
            this.confirmPassword = null;
            form.reset(true);
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while trying to change your password.");
            this.notificationService.error("", message);
        }

        this.submitted = false;
    }

    public async get(message?: EntityChanged) {
        if (message && message.type === "User" && message.change_type === ChangeType.Removed && message.id === this.user.id) {
            this.notificationService.error("", await this.wordTranslateService.translate("Your user account was deleted. Please create a new account."));
            return this.authService.logout();
        }

        try {
            await this.getUser();
            await this.getProjects();
            await this.getEmailNotificationSettings();
        } catch (ex) {}
    }

    public async getEmailNotificationSettings() {
        this.emailNotificationSettings = null;
        if (!this.currentProject.id) {
            return;
        }

        try {
            this.emailNotificationSettings = await this.projectService.getNotificationSettings(this.currentProject.id, this.user.id);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while loading the notification settings."));
        }
    }

    private async getProjects() {
        try {
            this.projects = await this.projectService.getAll();
            this.organizationNames = [];
            this.projects.forEach(project => {
                if (!this.organizationNames.find(name => name === project.organization_name)) {
                    this.organizationNames.push(project.organization_name);
                }
            });

            const currentProjectId = this.currentProject.id ? this.currentProject.id : this._projectId;
            this.currentProject = this.projects.filter(p => p.id === currentProjectId)[0];
            if (!this.currentProject) {
                this.currentProject = this.projects.length > 0 ? this.projects[0] : null;
            }

            this.hasPremiumFeatures = this.currentProject && this.currentProject.has_premium_features;
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while loading the projects."));
        }
    }

    private async getUser() {
        try {
            this.user = await this.userService.getCurrentUser();
            this.user.o_auth_accounts = this.user.o_auth_accounts || [];
            this.hasLocalAccount = this.user.has_local_account === true;
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while loading your user profile.");
            this.notificationService.error("", message);
        }
    }

    public async deleteAccount() {
        const modalCallBackFunction = async () => {
            try {
                await this.userService.removeCurrentUser();
                this.notificationService.success("", await this.wordTranslateService.translate("Successfully removed your user account."));
                this.authAccountService.logout();
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying remove your user account."));
            }
        };

        await this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to delete your account?", "DELETE ACCOUNT", modalCallBackFunction);
    }

    public hasPremiumEmailNotifications() {
        return this.user.email_notifications_enabled && this.emailNotificationSettings && this.hasPremiumFeatures;
    }

    public isExternalLoginEnabled(provider?: string) {
        if (!provider) {
            return !!environment.FACEBOOK_APPID || !!environment.GITHUB_APPID || !!environment.GOOGLE_APPID || !!environment.LIVE_APPID;
        }

        switch (provider) {
            case "facebook":
                return !!environment.FACEBOOK_APPID;
            case "github":
                return !!environment.GITHUB_APPID;
            case "google":
                return !!environment.GOOGLE_APPID;
            case "live":
                return !!environment.LIVE_APPID;
            default:
                return false;
        }
    }

    public async resendVerificationEmail() {
        try {
            await this.userService.resendVerificationEmail(this.user.id);
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while sending your verification email.");
            this.notificationService.error("", message);
        }
    }

    async saveEmailAddress(form: NgForm, isRetrying?: boolean) {
        const retry = (delay?) => {
            setTimeout(() => { this.saveEmailAddress(form, true); }, delay || 100);
        };

        if (!form || form.valid) {
            this._canSaveEmailAddress = true;
        }

        if (!this.user.email_address || form.pending) {
            return retry();
        }

        if (!this._canSaveEmailAddress) {
            return;
        }

        this._canSaveEmailAddress = false;

        try {
            const response: any = await this.userService.updateEmailAddress(this.user.id, this.user.email_address);
            this.user.is_email_address_verified = response.is_verified;
            this._canSaveEmailAddress = true;
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while saving your email address.");
            this.notificationService.error("", message);
        }
    }

    public async saveEmailNotificationSettings() {
        try {
            await this.projectService.setNotificationSettings(this.currentProject.id, this.user.id, this.emailNotificationSettings);
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while saving your notification settings.");
            this.notificationService.error("", message);
        }
    }

    public async saveEnableEmailNotification() {
        try {
            await this.userService.update(this.user.id, { email_notifications_enabled: this.user.email_notifications_enabled } as User);
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while saving your email notification preferences.");
            this.notificationService.error("", message);
        }
    }

    public async saveUser(isValid: boolean) {
        if (!isValid) {
            return;
        }

        try {
            await this.userService.update(this.user.id, this.user);
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while saving your full name.");
            this.notificationService.error("", message);
        }
    }

    public async showChangePlanDialog() {
        await this.billingService.changePlan(this.viewRef, () => {}, this.currentProject ? this.currentProject.organization_id : null);
    }

    public async unlink(account: OAuthAccount) {
        try {
            await this.authService.unlink(account.provider, account.provider_user_id).toPromise();
            this.user.o_auth_accounts.splice(this.user.o_auth_accounts.indexOf(account), 1);
        } catch (ex) {
            const message = await this.wordTranslateService.translate("An error occurred while removing the external login.");
            this.notificationService.error("", message);
        }
    }
}
