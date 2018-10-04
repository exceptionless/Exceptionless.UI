import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'ng2-ui-auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../../service/notification.service';
import { UserService } from '../../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVariables } from '../../../global-variables';
import { WordTranslateService } from '../../../service/word-translate.service';
import { AppEventService } from '../../../service/app-event.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {
    @Output() navigationCollapseToggle: EventEmitter<any> = new EventEmitter();
    user = {
        email_address: ''
    };
    gravatarStyle = {
        'border-style': 'solid',
        'border-color': '#ddd',
        'border-radius': '4px',
        'border-width': '0px'
    };
    constructor(
        private auth: AuthService,
        private router: Router,
        private notificationService: NotificationService,
        private userService: UserService,
        private translateService: TranslateService,
        private _globalVariables: GlobalVariables,
        private wordTranslateService: WordTranslateService,
        private appEvent: AppEventService
    ) {}

    ngOnInit() {
        this.getUser();
    }

    toggleSideNavCollapsed() {
        this.navigationCollapseToggle.emit(null);
    }

    logout() {
        this.auth.logout()
            .subscribe({
                error: (err: any) => this.notificationService.error('', 'Error Occurred!'),
                complete: () => this.router.navigate(['/login'])
            });
    }

    async getUser() {
        try {
            const res = await this.userService.getCurrentUser().toPromise();
            this.user = JSON.parse(JSON.stringify(res));
            this.userService.setAuthUser(this.user);
            this.appEvent.fireEvent({type: 'UPDATE_USER'});
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('Error Occurred!'));
        }
    }

    canChangePlan() {
        return !!this._globalVariables.STRIPE_PUBLISHABLE_KEY;
    }

    isIntercomEnabled() {
        return !!this._globalVariables.INTERCOM_APPID;
    }
}
