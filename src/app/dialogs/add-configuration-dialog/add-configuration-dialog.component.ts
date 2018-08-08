import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';

@Component({
    selector: 'app-add-configuration-dialog',
    templateUrl: './add-configuration-dialog.component.html'
})

export class AddConfigurationDialogComponent implements IModalDialog {
    configuration: any;
    data = {
        key: '',
        value: ''
    };
    constructor() {}

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.configuration = options.data['key'];
    }
}
