import { Directive, Input } from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

@Directive({
    selector: '[semanticVersion]',
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: SemanticVersionValidatorDirective, multi: true }]
})


export class SemanticVersionValidatorDirective implements AsyncValidator {

    constructor(
    ) {}

    validate(c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return new Promise((resolve, reject) => {
            if (typeof c.value !== 'string') {
                resolve(null);
            }

            const version = c.value.trim();
            if (version.length === 0) {
                resolve(null);
            }

            if (version.length > 256) {
                resolve({ 'semanticVersion': true });
            }

            const r = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
            const transformedInput = c.value.replace(r, '$1.$2.$3-$4');
            const regex = new RegExp('^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][a-zA-Z0-9-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][a-zA-Z0-9-]*))*))?(?:\\+([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?$');
            if (regex.test(transformedInput)) {
                resolve(null);
            } else {
                resolve({ 'semanticVersion': true });
            }
        });

    }
}
