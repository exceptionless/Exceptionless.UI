import { Directive, ElementRef, Output, EventEmitter, HostListener, Renderer2, Input, SimpleChanges } from '@angular/core';
import { FilterStoreService } from '../service/filter-store.service';

@Directive({
  selector: '[active]'
})
export class ActiveDirective {
    @Input('active') activeClass: string;

    constructor(
        private filterStoreService: FilterStoreService,
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

            this.renderer.removeClass(this._elementRef.nativeElement, 'active');
        } else {
            const classList = this._elementRef.nativeElement.classList.value;
            if (classList.includes('active')) {
                this.renderer.removeClass(this._elementRef.nativeElement, 'active');
            } else {
                this.renderer.addClass(this._elementRef.nativeElement, 'active');
            }
        }

        if (this.filterStoreService.getEventType() === this.activeClass) {
            this.renderer.addClass(this._elementRef.nativeElement, 'active');
        }
    }
}
