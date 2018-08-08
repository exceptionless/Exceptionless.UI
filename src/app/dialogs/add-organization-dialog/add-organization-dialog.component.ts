import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';
import { ModalParameterService } from '../../service/modal-parameter.service';

@Component({
    selector: 'app-add-organization-dialog',
    templateUrl: './add-organization-dialog.component.html'
})

export class AddOrganizationDialogComponent implements IModalDialog {
    data = {
        name: ''
    };
    dataKey = '';
    constructor(
        private modalParameterService: ModalParameterService
    ) {}

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.dataKey = options.data['key'];
    }

    setOrganization($event) {
        this.modalParameterService.setModalParameter(this.dataKey, this.data.name);
    }
}
