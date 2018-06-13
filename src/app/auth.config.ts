import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
    // Login-Url
    loginUrl : 'https://api.exceptionless.io/api/v2/auth/login',

    // Logout-Url
    logoutUrl : 'https://api.exceptionless.io/api/v2/auth/login',

    // Issuer
    issuer : 'https://steyer-identity-server.azurewebsites.net/identity',

    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin + '/type/error/dashboard',

    // The SPA's id. The SPA is registerd with this id at the auth-server
    clientId: 'spa-demo',

    // set the scope for the permissions the client should request
    // The first three are defined by OIDC. The 4th is a usecase-specific one
    scope: 'openid profile email voucher',
}
