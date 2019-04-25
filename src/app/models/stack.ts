export interface Stack {
    id: string;
    organization_id: string;
    project_id: string;
    type: string;
    signature_hash: string;
    signature_info: { [key: string]: string; };
    fixed_in_version: string;
    date_fixed: Date;
    title: string;
    total_occurrences: number;
    first_occurrence: Date;
    last_occurrence: Date;
    description: string;
    disable_notifications: boolean;
    is_hidden: boolean;
    is_regressed: boolean;
    occurrences_are_critical: boolean;
    references: string[];
    tags: string[];
    created_utc: Date;
    updated_utc: Date;
}
