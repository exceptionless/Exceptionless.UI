import { Directive, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Directive({
    selector: '[appAutoActive]'
})
export class AutoActiveDirective {

    constructor(
        private router: Router,
        private el: ElementRef) {

        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.checkActive(val.url);
            }
        });
    }

    checkActive(currentUrl) {
        let exist = false;
        const tt = this.el.nativeElement.getElementsByTagName('li');
        for (let i = 0; i < tt.length; i ++) {
            if (tt[i].getElementsByTagName('a').length > 0) {
                const a = tt[i].getElementsByTagName('a')[0];
                if (!a.attributes.href) {
                    continue;
                }
                const url = a.attributes.href.value;
                if (currentUrl === url) {
                    exist = true;
                    tt[i].classList.add('active');
                } else {
                    tt[i].classList.remove('active');
                }
            }
        }
        if (exist) {
            this.el.nativeElement.classList.add('active');
        } else {
            this.el.nativeElement.classList.remove('active');
        }
    }
}
