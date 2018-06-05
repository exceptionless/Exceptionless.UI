import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateRangeParserService {
    _rangeRegex: any = /(\d{4}-\d{2}-\d{2}(?:T(?:\d{2}:\d{2}:\d{2}|\d{2}:\d{2}|\d{2}))?)/g;

    constructor() {
    }

    parse(input) {
        if (!input) {
            return null;
        }

        let matches = [], found;
        while (found = this._rangeRegex.exec(input)) {
            matches.push(found[0]);
        }

        if (matches.length === 2) {
            return {
                start: matches[0],
                end: matches[1]
            };
        }

        return null;
    };
}
