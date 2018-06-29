import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Signup } from './signup.class';
import { NotificationService } from '../../service/notification.service';
import { AuthService } from 'ng2-ui-auth';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.less']
})
export class SignupComponent implements OnInit {
    model = new Signup();
    submitted = false;

    constructor(
        private router: Router,
        private auth: AuthService,
        private notificationService: NotificationService
    ) {
    }

    ngOnInit() {
    }

    onSubmit(isValid) {
        this.submitted = true;

        if (isValid) {
            const data = {
                name: this.model.name,
                email: this.model.email,
                password: this.model.password
            };

            this.auth.signup(data).subscribe(
                res => {
                    this.router.navigate(['/type/error/dashboard']);
                },
                err => {
                    this.notificationService.error('Signup failed!', 'Failed');
                }
            );
        }
    }

    checkEmailValidation() {
        /*this.authService.checkEmailUnique(this.model.email).subscribe(
            res => {
                console.log(this.model.email);
            },
            err => {
                console.log(err.status);
            }
        );*/
    }
}
