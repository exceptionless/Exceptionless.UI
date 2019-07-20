import { Component, ComponentRef } from "@angular/core";
import { IModalDialog, IModalDialogOptions, } from "ngx-modal-dialog";

@Component({
    selector: "app-confirm-dialog",
    templateUrl: "./confirm-dialog.component.html"
})

// TODO: Confirm this is working..
export class ConfirmDialogComponent implements IModalDialog {
    public text: string;

    constructor() {}

    public async dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        this.text = options.data.text;
    }
}
