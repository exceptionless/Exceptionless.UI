import { Injectable } from '@angular/core';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { WordTranslateService } from './word-translate.service';
import { AddReferenceDialogComponent } from '../dialogs/add-reference-dialog/add-reference-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class DialogService {

    constructor(
        private modalDialogService: ModalDialogService,
        private wordTranslateService: WordTranslateService) {
    }

    async confirm(viewRef, message, confirmButtonText, onConfirm) {
        return this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('DIALOGS_CONFIRMATION'),
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate(confirmButtonText), buttonClass: 'btn btn-primary', onAction: onConfirm }
            ],
            data: {
                text: await this.wordTranslateService.translate(message)
            }
        });
    }

    async confirmDanger(viewRef, message, confirmButtonText, onConfirm) {
        return this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('DIALOGS_CONFIRMATION'),
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate(confirmButtonText), buttonClass: 'btn btn-danger', onAction: onConfirm }
            ],
            data: {
                text: await this.wordTranslateService.translate(message)
            }
        });
    }

    async addReference(viewRef, onConfirm) {
        this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('Select Date Range'),
            childComponent: AddReferenceDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('Save Reference Link'), buttonClass: 'btn btn-primary', onAction: onConfirm }
            ],
            data: {
                key: 'referenceLink'
            }
        });
    }
}
