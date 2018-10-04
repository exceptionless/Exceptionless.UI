import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';
import { ModalParameterService } from '../../service/modal-parameter.service';

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
    constructor(
        private modalParameterService: ModalParameterService
    ) {}

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.configuration = options.data['key'];
    }
}
