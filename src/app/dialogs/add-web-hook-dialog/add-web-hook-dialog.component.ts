import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';
import { WordTranslateService } from '../../service/word-translate.service';
import { ModalParameterService } from '../../service/modal-parameter.service';

@Component({
    selector: 'app-add-web-hook-dialog',
    templateUrl: './add-web-hook-dialog.component.html'
})

export class AddWebHookDialogComponent implements IModalDialog {

    key: any = '';
    data = {
        url: '',
        event_types: []
    };
    eventTypes: any = [];

    constructor (
        private wordTranslateService: WordTranslateService,
        private modalParameterService: ModalParameterService
    ) {}

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.key = options.data['key'];
        this.initData();
    }

    async initData() {
        this.eventTypes = await this.getEventTypes();
    }

    updateValue() {
        this.data.event_types = [];
        for (let i = 0; i < this.eventTypes.length; i ++) {
            if (this.eventTypes[i].checked) {
                this.data.event_types.push(this.eventTypes[i].key);
            }
        }
        this.modalParameterService.setModalParameter(this.key, this.data);
    }

    async getEventTypes() {
        return [
            {
                key: 'NewError',
                name: await this.wordTranslateService.translate('New Error'),
                description: await this.wordTranslateService.translate('Occurs when a new error that has never been seen before is reported to your project.'),
                checked: false
            },
            {
                key: 'CriticalError',
                name: await this.wordTranslateService.translate('Critical Error'),
                description: await this.wordTranslateService.translate('Occurs when an error that has been marked as critical is reported to your project.'),
                checked: false
            },
            {
                key: 'StackRegression',
                name: await this.wordTranslateService.translate('Regression'),
                description: await this.wordTranslateService.translate('Occurs when an event that has been marked as fixed has reoccurred in your project.'),
                checked: false
            },
            {
                key: 'NewEvent',
                name: await this.wordTranslateService.translate('New Event'),
                description: await this.wordTranslateService.translate('Occurs when a new event that has never been seen before is reported to your project.'),
                checked: false
            },
            {
                key: 'CriticalEvent',
                name: await this.wordTranslateService.translate('Critical Event'),
                description: await this.wordTranslateService.translate('Occurs when an event that has been marked as critical is reported to your project.'),
                checked: false
            },
            {
                key: 'StackPromoted',
                name: await this.wordTranslateService.translate('Promoted'),
                description: await this.wordTranslateService.translate('Used to promote event stacks to external systems.'),
                checked: false
            }
        ];
    }

    hasEventTypeSelection() {
        return this.data.event_types.length > 0;
    }
}
