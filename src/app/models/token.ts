export interface Token {
    id: string;
    organization_id: string;
    project_id: string;
    user_id: string;
    default_project_id: string;
    scopes: string[];
    notes: string;
    expires_utc: Date;
    created_utc: Date;
    updated_utc: Date;
}

export interface NewToken {
    organization_id: string;
    project_id?: string;
    default_project_id?: string;
    scopes?: string[];
    notes?: string;
    expires_utc?: Date;
}
