import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions, } from 'ngx-modal-dialog';
import { WordTranslateService } from '../../service/word-translate.service';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html'
})

export class ConfirmDialogComponent implements IModalDialog {
    text = '';
    constructor(
        private wordTranslateService: WordTranslateService
    ) {}

    async dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        this.text = await this.wordTranslateService.translate('Are you sure you want to delete your account?');
        // no processing needed
        this.text = options.data['text'];
    }

    setText(content) {
        this.text = content;
    }
}
