import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, IModalDialogButton } from 'ngx-modal-dialog';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.less']
})

export class ConfirmDialogComponent implements IModalDialog {
    actionButtons: IModalDialogButton[];

    constructor() {
        this.actionButtons = [
            { text: 'Close', buttonClass: 'btn btn-default', onAction: () => true }, // no special processing here
            { text: 'Confirm', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => false }
        ];
    }

    ngOnInit() {
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
    }
}
