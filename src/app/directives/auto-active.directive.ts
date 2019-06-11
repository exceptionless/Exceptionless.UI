import { Directive, ElementRef } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";

@Directive({
  selector: "[appAutoActive]"
})
export class AutoActiveDirective {
  constructor(private router: Router, private el: ElementRef) {
    this.router.events.subscribe($event => {
      if ($event instanceof NavigationEnd) {
        this.checkActive($event.url);
      }
    });
  }

  private checkActive(currentUrl: string) {
    let exist = false;
    const tt = this.el.nativeElement.getElementsByTagName("li");
    for (const element of tt) {
      if (element.getElementsByTagName("a").length > 0) {
        const a = element.getElementsByTagName("a")[0];
        if (!a.attributes.href) {
          continue;
        }
        const url = a.attributes.href.value;
        if (currentUrl === url) {
          exist = true;
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      }
    }
    if (exist) {
      this.el.nativeElement.classList.add("active");
    } else {
      this.el.nativeElement.classList.remove("active");
    }
  }
}
