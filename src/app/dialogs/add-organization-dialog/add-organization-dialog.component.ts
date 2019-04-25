import { Component, ComponentRef } from "@angular/core";
import { IModalDialog, IModalDialogOptions, } from "ngx-modal-dialog";
import { ModalParameterService } from "../../service/modal-parameter.service";
import { AppEventService } from "../../service/app-event.service";
import { TypedMessage } from "src/app/models/messaging";

@Component({
    selector: "app-add-organization-dialog",
    templateUrl: "./add-organization-dialog.component.html"
})

export class AddOrganizationDialogComponent implements IModalDialog {
    public data = {
        name: ""
    };
    private dataKey: string;
    public submitted: boolean = false;

    constructor(
        private modalParameterService: ModalParameterService,
        private appEvent: AppEventService
    ) {
        this.appEvent.subscribe({
            next: (event: TypedMessage) => {
                if (event.type === "form_submitted") {
                    this.submitted = true;
                }
            }
        });
    }

    public dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        this.dataKey = options.data.key;
    }

    public setOrganization($event) {
        this.modalParameterService.setModalParameter(this.dataKey, this.data.name);
    }
}
