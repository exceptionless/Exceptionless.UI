export class LoginModel {
    email: string;
    password: string;
    invite_token: string;
}

export class SignupModel {
    name: string;
    email: string;
    password: string;
    invite_token: string;
}

export class ChangePasswordModel {
    current_password: string;
    password: string;
}

export class ResetPasswordModel {
    password_reset_token: string;
    password: string;
}

export class TokenResult {
    token: string;
}
