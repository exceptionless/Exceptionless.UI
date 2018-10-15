import { Directive, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[appSemver]',
    providers: [(NgModel)]
})
export class SemverDirective {

    constructor(private model: NgModel) {
    }

    @HostListener('ngModelChange', ['$event']) onModelChange(event) {
        const r = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        if (!r.test(event)) {
            return event;
        }

        // convert 4 part version to semver (1.2.3.4 to 1.2.3-4)
        const transformedInput = event.replace(r, '$1.$2.$3-$4');
        if (transformedInput !== event) {
            this.model.valueAccessor.writeValue(transformedInput);
        }
        return transformedInput;
    }
}
