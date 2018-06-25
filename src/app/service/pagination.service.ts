import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class PaginationService {
    constructor() {
    }

    getCurrentPageSummary(data, page, limit) {
        page = page ? parseInt(page) : 1;
        limit = limit ? parseInt(limit) : 100;

        const from = ((page - 1) * limit) + 1;
        const to = data && data.length > 0 ? from + data.length - 1 : from;

        return from + '-' + to;
    }
}
