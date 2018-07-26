import { Component, OnInit, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';

@Component({
    selector: 'app-add-configuration-dialog',
    templateUrl: './add-configuration-dialog.component.html',
    styleUrls: ['./add-configuration-dialog.component.less']
})
export class AddConfigurationDialogComponent implements OnInit {
    configuration: any;
    data = {
        key: '',
        value: ''
    };
    constructor() {
    }

    ngOnInit() {
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.configuration = options.data['key'];
    }
}
