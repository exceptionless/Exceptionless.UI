export interface LoginModel {
    email: string;
    password: string;
    invite_token: string;
}

export interface SignupModel {
    name: string;
    email: string;
    password: string;
    invite_token: string;
}

export interface ChangePasswordModel {
    current_password: string;
    password: string;
}

export interface ResetPasswordModel {
    password_reset_token: string;
    password: string;
}

export interface TokenResult {
    token: string;
}
