import { Component, OnInit } from '@angular/core';
import { Signup } from './signup.class';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.less']
})
export class SignupComponent implements OnInit {
    model = new Signup();
    submitted = false;

    constructor(
        private authService: AuthService,
        private toastr: ToastrService
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

            this.authService.signup(data).subscribe(
                res => {
                    this.toastr.success('Signup success!', 'Success');
                    if (res['token']) {
                        console.log(res['token']);
                    }
                },
                err => {
                    this.toastr.error('Signup failed!', 'Failed');
                }
            );
        }
    }

    checkEmailValidation() {
        this.authService.checkEmailUnique(this.model.email).subscribe(
            res => {
                console.log(this.model.email);
            },
            err => {
                console.log(err.status);
            }
        );
    }
}
