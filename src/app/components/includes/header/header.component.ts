import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import { AuthService } from 'ng2-ui-auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../../service/notification.service';
import { UserService } from '../../../service/user.service';

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
        private userService: UserService
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
                error: (err: any) => this.notificationService.error('Error Occurred!', 'Error'),
                complete: () => this.router.navigate(['/login'])
            });
    }

    getUser() {
        this.userService.getCurrentUser().subscribe(
            res => {
                this.user = JSON.parse(JSON.stringify(res));
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred');
            }
        );
    }
}
