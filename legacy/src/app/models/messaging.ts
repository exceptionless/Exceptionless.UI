export type AllTypedMessageTypes = PlanOverage | PlanChanged | SystemNotification | ReleaseNotification | UserMembershipChanged | EntityChanged | FilterChanged | FormSubmitted;
export class TypedMessage {
    type: string;
    message: AllTypedMessageTypes;
}

export enum ChangeType {
    Added = 0,
    Saved = 1,
    Removed = 2
}

export class UserMembershipChanged {
    change_type: ChangeType;
    user_id: string;
    organization_id: string;
}

export class PlanOverage {
    organization_id: string;
    is_hourly: boolean;
}

export class PlanChanged {
    organization_id: string;
}

export class SystemNotification {
    date: Date;
    message: string;
}

export class ReleaseNotification {
    critical: boolean;
    date: Date;
    message: string;
}

export class EntityChanged {
    type: string;
    id: string;
    organization_id: string;
    project_id?: string;
    stack_id?: string;
    change_type: ChangeType;
    data: { [key: string]: string | boolean; }; // possible keys UserId, IsAuthenticationToken
}

export class FilterChanged {
    type: string;
    organization_id: string;
    project_id?: string;
    filter?: string;
    offset?: string;
    time?: string;
}

export class FormSubmitted {}
