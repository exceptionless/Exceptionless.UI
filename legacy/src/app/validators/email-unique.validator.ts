import { Directive } from "@angular/core";
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from "@angular/forms";
import { AuthAccountService } from "../service/auth-account.service";

@Directive({
    selector: "[appUniqueEmail]",
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: EmailUniqueValidatorDirective, multi: true }]
})

export class EmailUniqueValidatorDirective implements AsyncValidator {
    constructor(private authAccountService: AuthAccountService) {}

    // TODO: Verify all of our validators component names are correct and that they are implemented to best standards.
    public async validate(c: AbstractControl): Promise<ValidationErrors | null> {
        return await this.authAccountService.isEmailAddressAvailable(c.value) ? null : { uniqueEmail: true };
    }
}
