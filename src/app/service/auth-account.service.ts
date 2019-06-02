import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "ng2-ui-auth";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "./notification.service";
import { WordTranslateService } from "./word-translate.service";
import { ChangePasswordModel, TokenResult, ResetPasswordModel } from "../models/auth";
import { $ExceptionlessClient } from "../exceptionless-client";
import { IUserInfo } from "exceptionless";

@Injectable({ providedIn: "root" })
export class AuthAccountService {
    constructor(
        private router: Router,
        private authService: AuthService,
        private http: HttpClient,
        private notificationService: NotificationService,
        public wordTranslateService: WordTranslateService
    ) {}

    public cancelResetPassword(resetToken: string) {
        return this.http.post(`auth/cancel-reset-password/${resetToken}`, {}).toPromise();
    }

    public async changePassword(changePasswordModel: ChangePasswordModel) {
        const response: any = await this.http.post<TokenResult>(`auth/change-password`, changePasswordModel).toPromise();
        this.authService.setToken(response.token);
        return response;
    }

    public forgotPassword(email: string) {
        return this.http.get<never>(`auth/forgot-password/${email}`).toPromise();
    }

    public getToken(): string {
        return this.authService.getToken();
    }

    public isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    public async isEmailAddressAvailable(email): Promise<boolean> {
      const response: any = this.http
        .get(`auth/check-email-address/${email}`, { observe: "response" })
        .toPromise();

      return response.status === 204;
    }

    public async logout(withRedirect?: boolean, params?) {
        try {
          await this.http.get<never>("auth/logout").toPromise();

          const user: IUserInfo = $ExceptionlessClient.config.defaultData["@user"];
          if (user && user.identity) {
            $ExceptionlessClient.submitSessionEnd(user.identity);
          }

          $ExceptionlessClient.config.setUserIdentity({});
          await this.authService.logout().toPromise();
          if (withRedirect) {
              this.router.navigate([withRedirect], params);
          } else {
              this.router.navigate(["/login"]);
          }
        } catch (ex) {
          $ExceptionlessClient.submitException(ex);
          this.notificationService.error("Failed!", "Error Occurred");
        }
    }

    public resetPassword(resetPasswordModel: ResetPasswordModel) {
        return this.http.post<never>("auth/reset-password", resetPasswordModel).toPromise();
    }

    public async unlink(providerName: string, providerUserId: string) {
        try {
            const response: any = await this.http.post<TokenResult>(`auth/unlink/${providerName}`, providerUserId).toPromise();
            this.authService.setToken(response);
        } catch (ex) {
          $ExceptionlessClient.submitException(ex);
          this.notificationService.error("Failed!", "Error Occurred");
        }
    }
}
