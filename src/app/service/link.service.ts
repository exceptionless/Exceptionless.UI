import { Injectable } from '@angular/core';
import * as li from 'li';

@Injectable({
    providedIn: 'root'
})
export class LinkService {

    constructor() {
    }

    getLinks(linkHeader) {
        if (linkHeader == null) {
            return {};
        }

        return li.parse(linkHeader || {});
    }

    getLinksQueryParameters(linkHeader) {
        const parsedLinks = this.getLinks(linkHeader);
        const links = {};

        for (const rel in parsedLinks) {
            const url = parsedLinks[rel];
            links[rel] = this.parseQueryString(url.slice(url.indexOf('?')));
        }

        return links;
    }

    parseQueryString(input) {
        // Source import from https://github.com/sindresorhus/query-string due to lack of browser support (node / requirejs).
        const result = Object.create(null);
        if (typeof input !== 'string') {
            return result;
        }

        input = input.trim().replace(/^(\?|#|&)/, '');

        if (!input) {
            return result;
        }

        input.split('&').forEach(function (param) {
            const parts = param.replace(/\+/g, ' ').split('=');
            // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            let key = parts.shift();
            let val = parts.length > 0 ? parts.join('=') : undefined;

            key = decodeURIComponent(key);

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (result[key] === undefined) {
                result[key] = val;
            } else if (Array.isArray(result[key])) {
                result[key].push(val);
            } else {
                result[key] = [result[key], val];
            }
        });

        return result;
    }
}
