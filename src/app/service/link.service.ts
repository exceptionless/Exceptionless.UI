import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BasicService } from './basic.service';
import { GlobalVariables } from "../global-variables";
import * as li from "li";

@Injectable({
    providedIn: 'root'
})
export class LinkService extends BasicService {

    constructor(
        http: HttpClient,
        _global: GlobalVariables
    ) {
        super(http, _global);
        this.route = '';
        this.type = '';
        this.data = {};
        this.authentication = false;
    }

    getLinks(linkHeader) {
        if (linkHeader == null)
            return {};

        return li.parse(linkHeader || {});
    };

    getLinksQueryParameters(linkHeader) {
        let parsedLinks = this.getLinks(linkHeader);
        let links = {};

        for (let rel in parsedLinks) {
            let url = parsedLinks[rel];
            links[rel] = this.parseQueryString(url.slice(url.indexOf('?')));
        }

        return links;
    };

    parseQueryString(input) {
        // Source import from https://github.com/sindresorhus/query-string due to lack of browser support (node / requirejs).
        let result = Object.create(null);
        if (typeof input !== 'string') {
            return result;
        }

        input = input.trim().replace(/^(\?|#|&)/, '');

        if (!input) {
            return result;
        }

        input.split('&').forEach(function (param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            var key = parts.shift();
            var val = parts.length > 0 ? parts.join('=') : undefined;

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
    };
}
