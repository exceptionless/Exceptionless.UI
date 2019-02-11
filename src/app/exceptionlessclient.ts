import * as exceptionless from 'exceptionless/dist/exceptionless.min';

export const $ExceptionlessClient = exceptionless.ExceptionlessClient.default;
$ExceptionlessClient.config.apiKey = environment.EXCEPTIONLESS_API_KEY;
if (environment.EXCEPTIONLESS_SERVER_URL) {
    $ExceptionlessClient.config.serverUrl = environment.EXCEPTIONLESS_SERVER_URL;
}
