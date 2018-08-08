import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';
import { ModalParameterService } from '../../service/modal-parameter.service';

@Component({
    selector: 'app-add-reference-dialog',
    templateUrl: './add-reference-dialog.component.html'
})

export class AddReferenceDialogComponent implements IModalDialog {
    data = {
        url: ''
    };
    dataKey = '';
    constructor(
        private modalParameterService: ModalParameterService
    ) {}

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.dataKey = options.data['key'];
    }

    setUrl($event) {
        this.modalParameterService.setModalParameter(this.dataKey, this.data.url);
    }
}
