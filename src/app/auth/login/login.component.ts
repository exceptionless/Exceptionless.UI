import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from './login.class';
import { AuthService } from 'ng2-ui-auth';
import { NotificationService } from "../../service/notification.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less']
})

export class LoginComponent implements OnInit {
    model = new Login();
    submitted = false;

    constructor(
        private auth: AuthService,
        private notificationService: NotificationService,
        private router: Router,
    ) {
       if (this.auth.isAuthenticated()) {
           this.router.navigate(['/type/error/dashboard']);
       }
    }

    ngOnInit() {
    }

    onSubmit(isValid) {
        this.submitted = true;

        if (isValid) {
            const loginData = {
                email: this.model.email,
                password: this.model.password
            };

            this.auth.login(loginData).subscribe(
                res => {
                    this.router.navigate(['/type/error/dashboard']);
                },
                err => {
                    this.notificationService.error('Failed', 'Login failed!');
                }
            );
        }
    }
}
