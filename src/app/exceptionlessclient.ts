import { ExceptionlessClient } from "exceptionless";
import { ErrorHandler } from "@angular/core";

export const $ExceptionlessClient = ExceptionlessClient.default;

// TODO: Is there a better way to initialize this logic.
$ExceptionlessClient.config.apiKey = environment.EXCEPTIONLESS_API_KEY;
if (environment.EXCEPTIONLESS_SERVER_URL) {
    $ExceptionlessClient.config.serverUrl = environment.EXCEPTIONLESS_SERVER_URL;
}
$ExceptionlessClient.config.setVersion("@@version"); // TODO: Set this a better way.
//$ExceptionlessClient.config.useDebugLogger();

// TODO: We need to inject the current user service and call set user..

export class ExceptionlessErrorHandler implements ErrorHandler {
  public handleError(ex: any) {
    $ExceptionlessClient.submitUnhandledException(ex, 'ExceptionlessErrorHandler');
  }
}
