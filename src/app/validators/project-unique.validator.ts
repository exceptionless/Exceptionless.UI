import { Directive, Input } from "@angular/core";
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from "@angular/forms";
import { ProjectService } from "../service/project.service";

@Directive({
    selector: "[appUniqueProject]",
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: ProjectUniqueValidatorDirective, multi: true }]
})


export class ProjectUniqueValidatorDirective implements AsyncValidator {
    @Input("appUniqueProject") organizationId: string;

    constructor(private projectService: ProjectService) {}

    public async validate(c: AbstractControl): Promise<ValidationErrors | null> {
        return await this.projectService.isNameAvailable(this.organizationId, c.value) ? null : { uniqueProject: true };
    }
}
