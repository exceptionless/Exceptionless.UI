import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NotificationService } from "../../../service/notification.service";
import { AuthService } from "ng2-ui-auth";
import { ProjectService } from "../../../service/project.service";
import { WordTranslateService } from "../../../service/word-translate.service";
import { SignupModel } from "src/app/models/auth";
import { ExternalLoginEnabled } from "../login/login.component";
import { $ExceptionlessClient } from "src/app/exceptionless-client";

@Component({
    selector: "app-signup",
    templateUrl: "./signup.component.html"
})

export class SignupComponent implements OnInit {
    private _source: string = "app.auth.Signup";
    public model: SignupModel = new SignupModel();
    public submitted: boolean = false;
    public isExternalLoginEnabled: ExternalLoginEnabled;

    constructor(
        private router: Router,
        private ng2Auth: AuthService,
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private wordTranslateService: WordTranslateService,
    ) {}

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
            await this.redirectOnSignup();
        } catch (ex) {
            $ExceptionlessClient.createFeatureUsage(`${this._source}.authenticate.error`).setProperty("error", ex).addTags(provider).submit();
            this.notificationService.error("", await this.wordTranslateService.translate("Login_Failed_Message"));
        }
    }

    public async onSubmit(isValid) {
        if (!isValid) {
            return;
        }

        // TODO: analytics & exceptionless
        this.submitted = true;
        try {
            const response: any = await this.ng2Auth.signup(this.model).toPromise();
            this.ng2Auth.setToken(response.token);
            await this.redirectOnSignup();
        } catch (ex) {
          $ExceptionlessClient.submitException(ex);
          this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while signing up.  Please contact support for more information."));
        }
    }

    private async redirectOnSignup() {
        try {
            const projects = (await this.projectService.getAll()).body;
            if (projects && projects.length > 0) {
                await this.router.navigateByUrl("/type/error/dashboard");
            } else {
                await this.router.navigateByUrl("/project/add");
            }
        } catch (ex) {
          $ExceptionlessClient.submitException(ex);
          await this.router.navigateByUrl("/project/add");
        }
    }
}
