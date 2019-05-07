export interface NewOrganization {
    name: string;
}

export interface Organization {
    id: string;
    created_utc: string;
    name: string;
    plan_id: string;
    plan_name: string;
    plan_description: string;
    card_last4: string;
    subscribe_date: string;
    billing_change_date: string;
    billing_changed_by_user_id: string;
    billing_status: BillingStatus;
    billing_price: number;
    max_events_per_month: number;
    bonus_events_per_month: number;
    bonus_expiration: string;
    retention_days: number;
    is_suspended: boolean;
    suspension_code: string;
    suspension_notes: string;
    suspension_date: string;
    has_premium_features: boolean;
    max_users: number;
    max_projects: number;
    project_count: number;
    stack_count: number;
    event_count: number;
    invites: Invite[];
    overage_hours: UsageInfo[];
    usage: UsageInfo[];
    data: { [key: string]: any; };
    is_over_hourly_limit: boolean;
    is_over_monthly_limit: boolean;
    is_over_request_limit: boolean;
}

export interface Invite {
    token: string;
    email_address: string;
    date_added: Date;
}

export enum BillingStatus {
    Trialing = 0,
    Active = 1,
    PastDue = 2,
    Canceled = 3,
    Unpaid = 4
}

export interface BillingPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    max_projects: number;
    max_users: number;
    retention_days: number;
    max_events_per_month: number;
    has_premium_features: boolean;
    is_hidden: boolean;
}

export interface Invoice {
    id: string;
    organization_id: string;
    organization_name: string;
    date: string;
    paid: boolean;
    total: number;
    items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
    description: string;
    date: string;
    amount: number;
}

export interface InvoiceGridModel {
    id: string;
    date: string;
    paid: boolean;
}

export interface UsageInfo {
    date: string;
    total: number;
    blocked: number;
    limit: number;
    too_big: number;
}

export interface ChangePlanResult {
    success: boolean;
    message: string;
}
