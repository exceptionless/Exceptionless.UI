export class User {
    id: string;
    organization_ids: string[];
    full_name: string;
    email_address: string;
    email_notifications_enabled: boolean;
    is_email_address_verified: boolean;
    is_active: boolean;
    is_invite: boolean;
    roles: string[];
}

export class CurrentUser extends User {
    hash: string;
    has_local_account: boolean;
    o_auth_accounts: OAuthAccount[];
}

export class OAuthAccount {
    provider: string;
    provider_user_id: string;
    username: string;
    readonly extra_data: { [key: string]: string; };
}

export class UpdateEmailAddressResult {
    is_verified: boolean;
}
