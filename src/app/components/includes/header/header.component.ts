import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import { AuthService } from 'ng2-ui-auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../../service/notification.service';
import { UserService } from '../../../service/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {
    @Output() navigationCollapseToggle: EventEmitter<any> = new EventEmitter();
    user = {
        email_address: ''
    };

    constructor(
        private auth: AuthService,
        private router: Router,
        private notificationService: NotificationService,
        private userService: UserService,
        private translateService: TranslateService,
    ) {}

    ngOnInit() {
        this.getUser();
       /* this.translateService.get('HELLO').subscribe((res: string) => {
            console.log(res);
        });*/
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

    getUser() {
        this.userService.getCurrentUser().subscribe(
            res => {
                this.user = JSON.parse(JSON.stringify(res));
            },
            err => {
                this.notificationService.error('', 'Error Occurred!');
            }
        );
    }
}
