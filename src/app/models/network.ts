export interface CountResult {
    readonly total: number;
    readonly aggregations: { [key: string]: IAggregate; };
    readonly data: { [key: string]: any; };
}

export interface IAggregate {
    readonly data: { [key: string]: any; };
}

export interface KeyValuePairStringStringValues {
    readonly key: string;
    readonly value: string[];
}

export interface ValueFromBodyString {
    readonly value: string;
}

export interface WorkInProgressResult {
    readonly workers: string[];
}

export interface QueryProcessResult {
    readonly is_valid: boolean;
    readonly uses_premium_features: boolean;
    readonly message: string;
}

export interface SuccessResult {
    readonly success: boolean;
}

export interface AboutResult {
    readonly informational_version: string;
    readonly app_mode: string;
    readonly machine_name: string;
}
