import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import { AuthService } from 'ng2-ui-auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../../service/notification.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
    @Output() navigationCollapseToggle: EventEmitter<any> = new EventEmitter();

    constructor(
        private auth: AuthService,
        private router: Router,
        private notificationService: NotificationService
    ) {
    }

    ngOnInit() {
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
}
