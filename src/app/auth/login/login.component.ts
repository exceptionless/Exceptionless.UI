import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from './login.class';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService  } from '@auth0/angular-jwt'

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
        private toastr: ToastrService,
        private router: Router,
        private jwtHelperService: JwtHelperService
    ) {}

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
                    localStorage.setItem('access_token', res['token']);

                    this.router.navigate(['/type/error/dashboard']);
                },
                err => {
                    this.toastr.error('Login failed!', 'Failed');
                }
            );
        }
    }
}
