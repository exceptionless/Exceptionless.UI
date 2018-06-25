export class GlobalFunctions {
    setQueryParam(url, params) {
        let full_url = url;
        let loop_index = 0;
        for (const key of Object.keys(params)) {
            if (loop_index === 0) {
                full_url = full_url + '?' + key + '=' + params[key];
            } else {
                full_url = full_url + '&' + key + '=' + params[key];
            }

            loop_index += 1;
        }

        return full_url;
    }
}
