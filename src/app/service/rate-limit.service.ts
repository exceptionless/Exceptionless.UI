import {Injectable} from "@angular/core";

@Injectable({ providedIn: "root" })
export class RateLimitService {
    private _rateLimit: number = -1;
    private _rateLimitExceeded: boolean = false;
    private _rateLimitRemaining: number = -1;

    constructor() {
    }

    public rateLimitExceeded(): boolean {
        return this._rateLimitExceeded;
    }

    // TODO: Hook into http interceptor.
    public updateFromResponseHeader(response) {
        const limit = parseInt(response.headers("X-RateLimit-Limit"), 10);
        this._rateLimit = !isNaN(limit) ? limit : -1;

        const limitRemaining = parseInt(response.headers("X-RateLimit-Remaining"), 10);
        this._rateLimitRemaining = !isNaN(limitRemaining) ? limitRemaining : -1;

        this._rateLimitExceeded = this._rateLimit > 0 ? this._rateLimitRemaining <= 0 : false;
    }
}
