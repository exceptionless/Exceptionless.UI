import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "ng2-ui-auth";
import { NotificationService } from "../../../service/notification.service";
import { WordTranslateService } from "../../../service/word-translate.service";
import { FilterService } from "../../../service/filter.service";
import { $ExceptionlessClient } from "../../../exceptionlessclient";
import { LoginModel } from "src/app/models/auth";

export class ExternalLoginEnabled {
    enabled: boolean;
    facebook: boolean;
    github: boolean;
    google: boolean;
    live: boolean;
}

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
    private _source: string = "app.auth.Login";
    private filterUrlPattern: string;
    private projectId: string;
    private projectType: string;

    public model: LoginModel = new LoginModel();
    public submitted: boolean = false;
    public isExternalLoginEnabled: ExternalLoginEnabled;

    constructor(
        private ng2Auth: AuthService,
        private notificationService: NotificationService,
        private router: Router,
        private filterService: FilterService,
        private wordTranslateService: WordTranslateService
    ) {
        if (this.ng2Auth.isAuthenticated()) {
            this.redirectOnLogin();
        }
    }

    public ngOnInit() {
        this.isExternalLoginEnabled = {
            enabled: this.isProviderEnabled(),
            facebook: this.isProviderEnabled("facebook"),
            github: this.isProviderEnabled("github"),
            google: this.isProviderEnabled("google"),
            live: this.isProviderEnabled("live")
        };
    }

    private isProviderEnabled(provider?: string) {
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

    public async authenticate(provider: string) {
        try {
            await this.ng2Auth.authenticate(provider).toPromise();
            $ExceptionlessClient.createFeatureUsage(`${this._source}.authenticate`).addTags(provider).submit();
            await this.redirectOnLogin();
        } catch (ex) {
            $ExceptionlessClient.createFeatureUsage(`${this._source}.authenticate.error`).setProperty("error", ex).addTags(provider).submit();
            this.notificationService.error("", await this.wordTranslateService.translate("Loggin_Failed_Message"));
        }
    }

    private async redirectOnLogin() {
        if (this.filterService.getProjectType() === "All Projects") {
            this.filterUrlPattern = "";
            await this.router.navigate(["/type/error/dashboard"]);
        } else {
            this.projectId = this.filterService.getProjectTypeId();
            this.projectType = this.filterService.getProjectType();
            if (!this.projectType) {
                this.filterService.setProjectFilter("All Projects", "", "All Projects");
                this.filterService.setTime("all");
                await this.router.navigate(["/type/error/dashboard"]);
            } else {
                this.filterUrlPattern = `${this.projectType}/${this.projectId}/`;
                await this.router.navigate([`${this.filterUrlPattern}/error/dashboard`]);
            }
        }
    }

    public async onSubmit(isValid: boolean) {
        if (!isValid) {
            return;
        }

        this.submitted = true;

        try {
            await this.ng2Auth.login(this.model).toPromise();
            $ExceptionlessClient.submitFeatureUsage(`${this._source}.login`);
            await this.redirectOnLogin();
        } catch (ex) {
            $ExceptionlessClient.createFeatureUsage(`${this._source}.login.error`).setUserIdentity(this.model.email).submit();
            this.notificationService.error("", await this.wordTranslateService.translate("Loggin_Failed_Message"));
        }
    }
}
