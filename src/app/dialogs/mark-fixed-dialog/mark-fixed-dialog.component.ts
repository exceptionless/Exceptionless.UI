import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';
import { ModalParameterService } from '../../service/modal-parameter.service';

@Component({
    selector: 'app-mark-fixed-dialog',
    templateUrl: './mark-fixed-dialog.component.html'
})
export class MarkFixedDialogComponent implements IModalDialog {

    dataKey = '';
    versionNo = '';

    constructor(private modalParameterService: ModalParameterService) {
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.dataKey = options.data['key'];
    }

    updateModalParameter(versionNo) {
        this.modalParameterService.setModalParameter(this.dataKey, versionNo);
    }
}
