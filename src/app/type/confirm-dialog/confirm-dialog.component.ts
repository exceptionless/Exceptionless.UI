import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.less']
})

export class ConfirmDialogComponent implements IModalDialog {
    text: string = 'Are you sure you want to delete your account?';

    constructor() {
    }

    ngOnInit() {
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
    };

    setText(content) {
        this.text = content;
    };
}
