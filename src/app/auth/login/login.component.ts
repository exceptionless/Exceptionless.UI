import {Component, OnInit} from '@angular/core';
import { Login } from './login.class';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less']
})

export class LoginComponent implements OnInit {
    model = new Login();
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
                email: this.model.email,
                password: this.model.password
            };

            this.authService.login(data).subscribe(
                res => {
                    this.toastr.success('Login success!', 'Success');
                },
                err => {
                    this.toastr.error('Login failed!', 'Failed');
                }
            );
        }
    }
}
