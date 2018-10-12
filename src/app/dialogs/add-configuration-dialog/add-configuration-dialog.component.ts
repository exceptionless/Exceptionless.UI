import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';
import { ModalParameterService } from '../../service/modal-parameter.service';
import { AppEventService } from '../../service/app-event.service';

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
    submitted = false;

    constructor(
        private modalParameterService: ModalParameterService,
        private appEvent: AppEventService
    ) {
        this.appEvent.subscribe({
            next: (event: any) => {
                if (event.type === 'form_submitted') {
                    this.submitted = true;
                }
            }
        });
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.configuration = options.data['key'];
    }

    updateValue() {
        this.modalParameterService.setModalParameter(this.configuration, this.data);
    }
}
