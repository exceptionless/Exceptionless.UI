import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html'
})

export class ConfirmDialogComponent implements IModalDialog {
    text = 'Are you sure you want to delete your account?';
    constructor() {}

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.text = options.data['text'];
    }

    setText(content) {
        this.text = content;
    }
}
