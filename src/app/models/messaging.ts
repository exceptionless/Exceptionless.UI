export interface TypedMessage {
    type: string;
    message: PlanOverage | PlanChanged | SystemNotification | ReleaseNotification | UserMembershipChanged | EntityChanged;
}

export enum ChangeType {
    Added = 0,
    Saved = 1,
    Removed = 2
}

export interface UserMembershipChanged {
    change_type: ChangeType;
    user_id: string;
    organization_id: string;
}

export interface PlanOverage {
    organization_id: string;
    is_hourly: boolean;
}

export interface PlanChanged {
    organization_id: string;
}

export interface SystemNotification {
    date: Date;
    message: string;
}

export interface ReleaseNotification {
    critical: boolean;
    date: Date;
    message: string;
}

export interface EntityChanged {
    type: string;
    id: string;
    organization_id: string;
    project_id?: string;
    stack_id?: string;
    change_type: ChangeType;
    data: { [key: string]: string | boolean; }; // possible keys UserId, IsAuthenticationToken
}
