import { Component, ComponentRef } from "@angular/core";
import { IModalDialog, IModalDialogOptions, } from "ngx-modal-dialog";
import { ModalParameterService } from "../../service/modal-parameter.service";
import { AppEventService } from "../../service/app-event.service";
import { TypedMessage } from "src/app/models/messaging";

@Component({
    selector: "app-add-configuration-dialog",
    templateUrl: "./add-configuration-dialog.component.html"
})

export class AddConfigurationDialogComponent implements IModalDialog {
    private configuration: any;
    public data = { // TODO: View is accessing data via indexer.
        key: "",
        value: ""
    };
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
        // no processing needed
        this.configuration = options.data.key;
    }

    public updateValue() {
        this.modalParameterService.setModalParameter(this.configuration, this.data);
    }
}
