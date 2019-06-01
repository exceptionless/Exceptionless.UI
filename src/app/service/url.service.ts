import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class UrlService {
    constructor() {}

    public buildUrl(isSecure, host, port, path, queryString) {
        if (!host) {
            return null;
        }

        let url = (isSecure ? "https://" : "http://") + host;

        if (port !== 80 && port !== 443) {
            url += ":" + port;
        }

        if (path) {
            if (path && path.indexOf("/") !== 0) {
                url += "/";
            }

            url += path;
        }

        if (!!queryString && Object.keys(queryString).length > 0) {
            let isFirst = true;
            for (const key of queryString) {
                if (isFirst) {
                    url += "?";
                    isFirst = false;
                } else {
                    url += "&";
                }

                url += key + "=" + queryString[key];
            }
        }

        return url;
    }
}
