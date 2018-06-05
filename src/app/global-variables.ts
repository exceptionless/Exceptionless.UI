import { Injectable } from '@angular/core';

@Injectable()
export class GlobalVariables {
    readonly BASE_URL: string = 'https://api.exceptionless.io/';
    readonly EXCEPTIONLESS_API_KEY: string = '';
    readonly EXCEPTIONLESS_SERVER_URL: string = '';
    readonly FACEBOOK_APPID: string = '';
    readonly GITHUB_APPID: string = '';
    readonly GOOGLE_APPID: string = '';
    readonly INTERCOM_APPID: string = '';
    readonly LIVE_APPID: string = '';
    readonly SLACK_APPID: string = '';
    readonly STRIPE_PUBLISHABLE_KEY: string = '';
    readonly SYSTEM_NOTIFICATION_MESSAGE: string = '';
    readonly USE_HTML5_MODE: boolean = false;
    readonly USE_SSL: boolean = false;
    readonly ENABLE_ACCOUNT_CREATION: boolean = true;
}
