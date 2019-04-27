import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthAccountService } from "../../../service/auth-account.service";
import { NotificationService } from "../../../service/notification.service";
import { WordTranslateService } from "../../../service/word-translate.service";
import { ResetPasswordModel } from "src/app/models/auth";

@Component({
    selector: "app-reset-password",
    templateUrl: "./reset-password.component.html"
})

export class ResetPasswordComponent implements OnInit {
    private _cancelResetToken: boolean = true;
    public model: ResetPasswordModel = new ResetPasswordModel();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private authAccountService: AuthAccountService,
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService
    ) {
        this.activatedRoute.params.subscribe(params => {
            this.model.password_reset_token = params.tokenId;
            this._cancelResetToken = params.cancel;
        });
    }

    public ngOnInit() {
        if (this._cancelResetToken) {
            this.cancelResetPassword();
        }
    }

    public async changePassword(isValid) {
        if (!isValid) {
            return;
        }

        try {
            await this.authAccountService.resetPassword(this.model);
            this.notificationService.info("", await this.wordTranslateService.translate("You have successfully changed your password."));
            await this.router.navigate(["/login"]);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to change your password."));
        }
    }

    public async cancelResetPassword() {
        try {
            await this.authAccountService.cancelResetPassword(this.model.password_reset_token);
            await this.router.navigate(["/login"]);
        } catch (ex) {
            await this.router.navigate(["/login"]);
        }
    }
}
