import { Injectable, EventEmitter } from '@angular/core';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { WordTranslateService } from './word-translate.service';
import { AddReferenceDialogComponent } from '../dialogs/add-reference-dialog/add-reference-dialog.component';
import { MarkFixedDialogComponent } from '../dialogs/mark-fixed-dialog/mark-fixed-dialog.component';
import { ModalParameterService } from './modal-parameter.service';
import { ChangePlanDialogComponent } from '../dialogs/change-plan-dialog/change-plan-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class DialogService {

    constructor(
        private modalDialogService: ModalDialogService,
        private wordTranslateService: WordTranslateService,
        private modalParameterService: ModalParameterService) {
    }

    async confirm(viewRef, message, confirmButtonText, onConfirm) {
        return this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('DIALOGS_CONFIRMATION'),
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate(confirmButtonText), buttonClass: 'btn btn-primary', onAction: () => {
                    onConfirm();
                    return true;
                }}
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
                { text: await this.wordTranslateService.translate(confirmButtonText), buttonClass: 'btn btn-danger', onAction: () => {
                    onConfirm();
                    return true;
                }}
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

    async markFixed(viewRef, onConfirm) {
        this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('Mark Fixed'),
            childComponent: MarkFixedDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('Mark Fixed'), buttonClass: 'btn btn-primary', onAction: () => {
                    const versionNo = this.modalParameterService.getModalParameter('version');
                    const r = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
                    onConfirm(versionNo.replace(r, '$1.$2.$3-$4'));
                    return true;
                }}
            ],
            data: {
                key: 'version'
            }
        });
    }

    async changePlan(viewRef, organizationId, onConfirm) {
        const saveEventFire: EventEmitter<any> = new EventEmitter();
        const closeEventFire: EventEmitter<any> = new EventEmitter();

        return this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('Exceptionless Plan'),
            childComponent: ChangePlanDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('Changing Plan'), buttonClass: 'btn btn-primary', onAction: () => {
                    saveEventFire.emit();
                    closeEventFire.subscribe(() => {
                        onConfirm();
                        return true;
                    });
                }}
            ],
            data: {
                organizationId: organizationId,
                saveEvent: saveEventFire,
                closeEvent: closeEventFire
            }
        });
    }
}
