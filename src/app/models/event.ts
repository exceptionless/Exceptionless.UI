export interface PersistentEvent {
    readonly id: string;
    readonly organization_id: string;
    readonly project_id: string;
    readonly stack_id: string;
    readonly is_first_occurrence: boolean;
    readonly is_fixed: boolean;
    readonly is_hidden: boolean;
    readonly created_utc: Date;
    readonly updated_utc: Date;
    readonly is_deleted: boolean;
    readonly type: string;
    readonly source: string;
    readonly date: Date;
    readonly tags: string[];
    readonly message: string;
    readonly geo: string;
    readonly value: number;
    readonly count: number;
    readonly data: { [key: string]: any; }; // TODO: Fill out all the event types.
    readonly reference_id: string;
}

export interface UserDescription {
    email_address: string;
    description: string;
    data: { [key: string]: any; };
}
