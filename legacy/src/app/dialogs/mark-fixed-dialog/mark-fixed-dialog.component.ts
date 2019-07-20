import { Component, ComponentRef } from "@angular/core";
import { IModalDialog, IModalDialogOptions } from "ngx-modal-dialog";
import { ModalParameterService } from "../../service/modal-parameter.service";
import { AppEventService } from "../../service/app-event.service";
import { TypedMessage } from "src/app/models/messaging";

@Component({
    selector: "app-mark-fixed-dialog",
    templateUrl: "./mark-fixed-dialog.component.html"
})
export class MarkFixedDialogComponent implements IModalDialog {
    private dataKey: string;
    public versionNo: string;
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
        this.dataKey = options.data.key;
    }

    public updateModalParameter(versionNo: string) {
        this.modalParameterService.setModalParameter(this.dataKey, versionNo);
    }
}
