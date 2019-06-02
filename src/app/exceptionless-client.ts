import { ExceptionlessClient } from "exceptionless";
import { ErrorHandler, Injectable } from "@angular/core";
import { UserService } from "./service/user.service";

export const $ExceptionlessClient = ExceptionlessClient.default;

@Injectable({ providedIn: "root" })
export class ExceptionlessClientInit {
  constructor(private userService: UserService) {
    const client = $ExceptionlessClient;

    client.config.apiKey = environment.EXCEPTIONLESS_API_KEY;
    if (environment.EXCEPTIONLESS_SERVER_URL) {
        client.config.serverUrl = environment.EXCEPTIONLESS_SERVER_URL;
    }

    client.config.defaultTags.push("UI");
    client.config.setVersion("@@version"); // TODO: Set this a better way.
    client.config.useReferenceIds();
    client.config.useSessions();
    // client.config.useDebugLogger();

    // TODO: Subscribe to user updates and set the user; Currently setting this in the header component..
    // const user = await userService.getCurrentUser();
    // client.config.setUserIdentity({ identity: user.email_address, name: user.full_name, data: { user }});
  }

  public init() {}
}

export class ExceptionlessErrorHandler implements ErrorHandler {
  public handleError(ex: any) {
    $ExceptionlessClient.submitUnhandledException(ex, "ExceptionlessErrorHandler");
  }
}
