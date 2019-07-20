import { UsageInfo } from "./organization";

export class Project {
    id: string;
    organization_id: string;
    organization_name: string;
    name: string;
    delete_bot_data_enabled: boolean;
    data: { [key: string]: any; };
    promoted_tabs: string[];
    is_configured: boolean;
    stack_count: number;
    event_count: number;
    has_premium_features: boolean;
    has_slack_integration: boolean;
    overage_hours: UsageInfo[];
    usage: UsageInfo[];
    created_utc: Date;
}

export class NewProject {
    organization_id: string;
    name: string;
    delete_bot_data_enabled: boolean;
}

export class NotificationSettings {
    send_daily_summary: boolean;
    report_new_errors: boolean;
    report_critical_errors: boolean;
    report_event_regressions: boolean;
    report_new_events: boolean;
    report_critical_events: boolean;
}

export class ClientConfiguration {
    version: number;
    readonly settings: { [key: string]: string; };
}
