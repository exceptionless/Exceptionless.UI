import { Directive, ElementRef, Output, EventEmitter, HostListener, Renderer2, Input, OnInit } from "@angular/core";
import { FilterStoreService } from "../service/filter-store.service";
import { Router } from "@angular/router";

@Directive({
  selector: "[appActive]"
})

export class ActiveDirective implements OnInit {
    @Input() active: string;
    currentActive: string;
    constructor(
        private filterStoreService: FilterStoreService,
        private _elementRef: ElementRef,
        private renderer: Renderer2,
        private router: Router
    ) {
        const url = this.router.url.split("?")[0];
        if (url === "/account/manage" || url === "/project/list" || url === "/organization/list") {
            this.currentActive = "admin";
        } else {
            this.currentActive = this.filterStoreService.getEventType();
            if (typeof this.currentActive === "object") {
                this.currentActive = "events";
            }
        }
    }

    @Output()
    public clickOutside = new EventEmitter();

    @HostListener("document:click", ["$event.target"])
    public onClick(targetElement: Element) {
        const menuParent = document.querySelectorAll("ul.left-menu")[0];
        const isInMenu = menuParent.contains(targetElement);
        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        const collapseObject = this._elementRef.nativeElement.querySelectorAll("a")[0];
        const collapseObjectClicked = collapseObject.contains(targetElement);
        if (!clickedInside && isInMenu) {
            this.clickOutside.emit(null);
            this.renderer.removeClass(this._elementRef.nativeElement, "active");
        } else if (clickedInside && isInMenu) {
            const classList = this._elementRef.nativeElement.classList.value;
            if (classList.includes("active") && collapseObjectClicked) {
                this.renderer.removeClass(this._elementRef.nativeElement, "active");
            } else {
                this.renderer.addClass(this._elementRef.nativeElement, "active");
            }
        }
    }

    public ngOnInit() {
        if (this.active === this.currentActive) {
            this.renderer.addClass(this._elementRef.nativeElement, "active");
        }
    }
}
