import { Component, ComponentRef } from "@angular/core";
import { IModalDialog, IModalDialogOptions, } from "ngx-modal-dialog";
import { ModalParameterService } from "../../service/modal-parameter.service";
import { AppEventService } from "../../service/app-event.service";
import { TypedMessage } from "src/app/models/messaging";

@Component({
    selector: "app-add-reference-dialog",
    templateUrl: "./add-reference-dialog.component.html"
})

export class AddReferenceDialogComponent implements IModalDialog {
    public data = {
        url: ""
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

    public setUrl($event) {
        this.modalParameterService.setModalParameter(this.dataKey, this.data.url);
    }
}
