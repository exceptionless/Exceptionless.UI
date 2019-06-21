import { Directive, HostListener } from "@angular/core";
import { NgModel } from "@angular/forms";

@Directive({
    selector: "[appSemver]",
    providers: [(NgModel)]
})
export class SemverDirective {
    constructor(private model: NgModel) {}

    @HostListener("ngModelChange", ["$event"])
    public onModelChange(input) {
        const r = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        if (!input || !r.test(input)) {
            return input;
        }

        // convert 4 part version to semver (1.2.3.4 to 1.2.3-4)
        let transformedInput = "";
        const isTwoPartVersion = /^(\d+)\.(\d+)$/;
        const isFourPartVersion = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        if (isTwoPartVersion.test(input)) {
            transformedInput = input.replace(isTwoPartVersion, "$1.$2.0");
        } else if (isFourPartVersion.test(input)) {
            transformedInput = input.replace(isFourPartVersion, "$1.$2.$3-$4");
        }

        if (transformedInput !== input) {
            this.model.valueAccessor.writeValue(transformedInput);
        }

        return transformedInput;
    }
}
