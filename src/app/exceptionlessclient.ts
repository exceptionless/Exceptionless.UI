import { ExceptionlessClient } from 'exceptionless';

export const $ExceptionlessClient = ExceptionlessClient.default;
$ExceptionlessClient.config.apiKey = environment.EXCEPTIONLESS_API_KEY;
if (environment.EXCEPTIONLESS_SERVER_URL) {
    $ExceptionlessClient.config.serverUrl = environment.EXCEPTIONLESS_SERVER_URL;
}
