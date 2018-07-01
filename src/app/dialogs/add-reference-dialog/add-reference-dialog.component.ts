import { Component, OnInit, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';
import { ModalParameterService } from '../../service/modal-parameter.service';

@Component({
    selector: 'app-add-reference-dialog',
    templateUrl: './add-reference-dialog.component.html',
    styleUrls: ['./add-reference-dialog.component.less']
})

export class AddReferenceDialogComponent implements OnInit {
    data = {
        url: ''
    };
    dataKey = '';

    constructor(
        private modalParameterService: ModalParameterService
    ) {
    }

    ngOnInit() {
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.dataKey = options.data['key'];
    }

    setUrl() {
        this.modalParameterService.setModalParameter(this.dataKey, this.data.url);
    }
}
