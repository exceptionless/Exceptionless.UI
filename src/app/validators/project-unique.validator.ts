import { Directive, Input } from "@angular/core";
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from "@angular/forms";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import { ProjectService } from "../service/project.service";

@Directive({
    selector: "[appUniqueProject]",
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: ProjectUniqueValidatorDirective, multi: true }]
})


export class ProjectUniqueValidatorDirective implements AsyncValidator {
    @Input("appUniqueProject") organizationId: string;

    constructor(
        private projectService: ProjectService
    ) {}

    public validate(c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return this.projectService.isNameAvailable(this.organizationId, c.value).map(
            res => {
                if (res.status === 201 ) {
                    return { uniqueProject: true };
                } else {
                    return null;
                }
            }
        );
    }
}
