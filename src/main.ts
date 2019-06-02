import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { enableProdMode } from "@angular/core";
import { $ExceptionlessClient } from "./app/exceptionless-client";

enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(ex => {
    console.log(ex);
    $ExceptionlessClient.submitException(ex);
  });
