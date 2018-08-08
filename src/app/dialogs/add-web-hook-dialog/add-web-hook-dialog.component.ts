import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';

@Component({
    selector: 'app-add-web-hook-dialog',
    templateUrl: './add-web-hook-dialog.component.html'
})

export class AddWebHookDialogComponent implements IModalDialog {
    constructor() {}

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
    }
}
