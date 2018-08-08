import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';

@Component({
    selector: 'app-change-plan-dialog',
    templateUrl: './change-plan-dialog.component.html'
})

export class ChangePlanDialogComponent implements IModalDialog {
    constructor() {
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
    }

}
