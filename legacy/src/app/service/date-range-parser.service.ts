import {Injectable} from "@angular/core";

@Injectable({ providedIn: "root" })
export class DateRangeParserService {
    _rangeRegex: RegExp = /(\d{4}-\d{2}-\d{2}(?:T(?:\d{2}:\d{2}:\d{2}|\d{2}:\d{2}|\d{2}))?)/g;
    constructor() {}

    public parse(input): { start: string, end: string } {
        if (!input) {
            return null;
        }

        const matches = [];
        let found: RegExpExecArray;
        while (true) {
            found = this._rangeRegex.exec(input);
            if (!found) {
                break;
            }

            matches.push(found[0]);
        }

        if (matches.length === 2) {
            return {
                start: matches[0],
                end: matches[1]
            };
        }

        return null;
    }
}
