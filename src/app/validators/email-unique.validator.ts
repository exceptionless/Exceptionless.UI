import { AbstractControl } from '@angular/forms';
import { AuthAccountService } from '../service/auth-account.service';
import 'rxjs/add/operator/map';

export class EmailUniqueValidator {
    static createValidator(authAccountService: AuthAccountService) {
        return (control: AbstractControl) => {
            return authAccountService.isEmailAddressAvailable(control.value).map(
                res => {
                    console.log('status');
                },
                err => {
                    console.log('false');
                }
            );
        };
    }
}
