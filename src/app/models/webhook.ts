export class WebHook {
    id: string;
    organization_id: string;
    project_id: string;
    url: string;
    event_types: string[];
    is_enabled: boolean;
    version: string;
    created_utc: Date;
}

export class NewWebHook {
    organization_id: string;
    project_id: string;
    url: string;
    event_types: string[];
    version: string;
}
