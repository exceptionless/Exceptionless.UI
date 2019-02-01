import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
    selector: '[ui-scroll]'
})

export class UiScrollDirective {
    constructor() {}

    @Output()
    public clickOutside = new EventEmitter();

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.tagName === 'I' && targetElement.classList.value.indexOf('icon-scroll') >= 0) {
            const scrollToTop = window.setInterval(() => {
                const pos = window.pageYOffset;
                if (pos > 0) {
                    window.scrollTo(0, pos - 20); // how far to scroll on each step
                } else {
                    window.clearInterval(scrollToTop);
                }
            }, 16);
        }
    }
}
