import { browser, by, element } from "protractor";

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl);
  }

  getTitleText() {
    return element(by.css("app-root h1")).getText() as Promise<string>;
  }
}
