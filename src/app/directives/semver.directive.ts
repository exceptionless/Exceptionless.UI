import { Directive, HostListener } from "@angular/core";
import { NgModel } from "@angular/forms";

@Directive({
    selector: "[appSemver]",
    providers: [(NgModel)]
})
export class SemverDirective {

    constructor(private model: NgModel) {
    }

    @HostListener("ngModelChange", ["$event"]) onModelChange(event) {
        const r = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        if (!r.test(event)) {
            return event;
        }
        // TODO: Ensure this is copied over from the oiriginal project.
        // var transformedInput = '';
        // var isTwoPartVersion = /^(\d+)\.(\d+)$/;
        // var isFourPartVersion = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        // if (isTwoPartVersion.test(inputValue)) {
        //     transformedInput = inputValue.replace(isTwoPartVersion, '$1.$2.0');
        // } else if (isFourPartVersion.test(inputValue)) {
        //     transformedInput = inputValue.replace(isFourPartVersion, '$1.$2.$3-$4');
        // }
        //
        // if (transformedInput !== '') {
        //     modelCtrl.$setViewValue(transformedInput);
        //     modelCtrl.$render();
        // }

        // convert 4 part version to semver (1.2.3.4 to 1.2.3-4)
        let transformedInput = "";
        const isTwoPartVersion = /^(\d+)\.(\d+)$/;
        const isFourPartVersion = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        if (isTwoPartVersion.test(event)) {
            transformedInput = event.replace(isTwoPartVersion, "$1.$2.0");
        } else if (isFourPartVersion.test(event)) {
            transformedInput = event.replace(isFourPartVersion, "$1.$2.$3-$4");
        }

        if (transformedInput !== event) {
            this.model.valueAccessor.writeValue(transformedInput);
        }
        return transformedInput;
    }
}
