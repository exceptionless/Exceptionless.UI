import {Injectable} from "@angular/core";

@Injectable({
    providedIn: "root"
})

export class PaginationService {
    constructor() {}

    public getCurrentPageSummary(data, page: number, limit: number) {
        page = page ? parseInt(page + "", 10) : 1;
        limit = limit ? parseInt(limit + "", 10) : 100;

        const from = ((page - 1) * limit) + 1;
        const to = data && data.length > 0 ? from + data.length - 1 : from;

        return from + "-" + to;
    }
}
