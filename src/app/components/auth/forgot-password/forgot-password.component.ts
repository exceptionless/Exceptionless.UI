import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NotificationService } from "../../../service/notification.service";
import { AuthAccountService } from "../../../service/auth-account.service";
import { WordTranslateService } from "../../../service/word-translate.service";

@Component({
    selector: "app-forgot-password",
    templateUrl: "./forgot-password.component.html"
})

export class ForgotPasswordComponent implements OnInit {
    public emailAddress: string;

    constructor(
        private router: Router,
        private notificationService: NotificationService,
        private authAccountService: AuthAccountService,
        private wordTranslateService: WordTranslateService
    ) {}

    public ngOnInit() {
    }

    public async resetPassword(isValid: boolean) {
        if (!isValid) {
            return;
        }

        try {
            await this.authAccountService.forgotPassword(this.emailAddress);
            this.notificationService.info("", await this.wordTranslateService.translate("ResetPassword_Success_Message"));
            return this.router.navigate(["/login"]);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("ResetPassword_Failed_Message"));
        }
    }
}
