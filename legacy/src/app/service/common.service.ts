import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CommonService {
    constructor() {}

    public parseExpiry(value: string) {
        let month: string | number;
        let prefix: string;
        let year: string | number;
        let _ref: string[];

        value = value || "";

        value = value.replace(/\s/g, "");
        _ref = value.split("/", 2), month = _ref[0], year = _ref[1];

        if ((year != null ? year.length : void 0) === 2 && /^\d+$/.test(year)) {
            prefix = (new Date()).getFullYear().toString().slice(0, 2);
            year = prefix + year;
        }

        month = parseInt(month, 10);
        year = parseInt(year, 10);

        return {
            month,
            year
        };
    }
}
