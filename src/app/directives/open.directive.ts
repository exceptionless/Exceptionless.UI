import { Directive, ElementRef, Output, EventEmitter, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[open]'
})

export class OpenDirective {
    constructor(
        private _elementRef: ElementRef,
        private  renderer: Renderer2
    ) {
    }

    @Output()
    public clickOutside = new EventEmitter();

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.clickOutside.emit(null);

            this.renderer.removeClass(this._elementRef.nativeElement, 'open');
        } else {
            const classList = this._elementRef.nativeElement.classList.value;
            if (classList.includes('open')) {
                this.renderer.removeClass(this._elementRef.nativeElement, 'open');
            } else {
                this.renderer.addClass(this._elementRef.nativeElement, 'open');
            }
        }
    }
}
