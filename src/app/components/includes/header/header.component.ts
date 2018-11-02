import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'ng2-ui-auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../../service/notification.service';
import { UserService } from '../../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { WordTranslateService } from '../../../service/word-translate.service';
import { AppEventService } from '../../../service/app-event.service';
import { Intercom } from 'ng-intercom';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {
    @Output() navigationCollapseToggle: EventEmitter<any> = new EventEmitter();
    @Output() showResponsiveSideToggle: EventEmitter<any> = new EventEmitter();
    @Output() showResponsiveNavToggle: EventEmitter<any> = new EventEmitter();
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
        private wordTranslateService: WordTranslateService,
        private appEvent: AppEventService,
        private intercom: Intercom
    ) {}

    ngOnInit() {
        this.getUser();
    }

    toggleSideNavCollapsed() {
        this.navigationCollapseToggle.emit(null);
    }
    toggleResponsiveSide() {
        this.showResponsiveSideToggle.emit(null);
    }

    toggleResponsiveNav() {
        this.showResponsiveNavToggle.emit(null);
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
            const res = await this.userService.getCurrentUser();
            this.user = JSON.parse(JSON.stringify(res));
            this.userService.setAuthUser(this.user);
            this.appEvent.fireEvent({type: 'UPDATE_USER'});
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('Error Occurred!'));
        }
    }

    canChangePlan() {
        return !!environment.STRIPE_PUBLISHABLE_KEY;
    }

    isIntercomEnabled() {
        return !!environment.INTERCOM_APPID;
    }

    showIntercom() {
        this.intercom.showNewMessage();
    }
}
