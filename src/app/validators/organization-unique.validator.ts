import { Directive } from "@angular/core";
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from "@angular/forms";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import { OrganizationService } from "../service/organization.service";

@Directive({
    selector: "[appUniqueOrganization]",
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: OrganizationUniqueValidatorDirective, multi: true }]
})

export class OrganizationUniqueValidatorDirective implements AsyncValidator {
    constructor(
        private organizationService: OrganizationService
    ) {}

    public validate(c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return this.organizationService.isNameAvailable(c.value).map(
            res => {
                if (res.status === 201 ) {
                    return { uniqueOrganization: true };
                } else {
                    return null;
                }
            }
        );
    }
}
