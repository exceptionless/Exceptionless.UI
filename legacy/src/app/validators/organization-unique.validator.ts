import { Directive } from "@angular/core";
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from "@angular/forms";
import { OrganizationService } from "../service/organization.service";

@Directive({
    selector: "[appUniqueOrganization]",
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: OrganizationUniqueValidatorDirective, multi: true }]
})

export class OrganizationUniqueValidatorDirective implements AsyncValidator {
    constructor(private organizationService: OrganizationService) {}

    public async validate(c: AbstractControl): Promise<ValidationErrors | null> {
        return await this.organizationService.isNameAvailable(c.value) ? null : { uniqueOrganization: true };
    }
}
