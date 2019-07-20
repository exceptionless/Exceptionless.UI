import { Component, ComponentRef } from "@angular/core";
import { IModalDialog, IModalDialogOptions, } from "ngx-modal-dialog";
import { ModalParameterService } from "../../service/modal-parameter.service";
import { AppEventService } from "../../service/app-event.service";
import { TypedMessage } from "src/app/models/messaging";

@Component({
    selector: "app-add-user-dialog",
    templateUrl: "./add-user-dialog.component.html"
})

export class AddUserDialogComponent implements IModalDialog {
    public data = {
        email: ""
    };
    private dataKey: string;
    public submitted: boolean = false;

    constructor(
        private modalParameterService: ModalParameterService,
        private appEvent: AppEventService
    ) {
        this.appEvent.subscribe({
            next: (event: TypedMessage) => {
                if (event.type === "form_submitted") { // TODO: Where is this message type coming from?
                    this.submitted = true;
                }
            }
        });
    }

    public dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        this.dataKey = options.data.key;
    }

    public setEmail($event) {
        this.modalParameterService.setModalParameter(this.dataKey, this.data.email);
    }
}
