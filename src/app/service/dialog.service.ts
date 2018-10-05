import { Injectable, EventEmitter } from '@angular/core';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { WordTranslateService } from './word-translate.service';
import { AddReferenceDialogComponent } from '../dialogs/add-reference-dialog/add-reference-dialog.component';
import { MarkFixedDialogComponent } from '../dialogs/mark-fixed-dialog/mark-fixed-dialog.component';
import { ModalParameterService } from './modal-parameter.service';
import { ChangePlanDialogComponent } from '../dialogs/change-plan-dialog/change-plan-dialog.component';
import { AddUserDialogComponent } from '../dialogs/add-user-dialog/add-user-dialog.component';
import { AddConfigurationDialogComponent } from '../dialogs/add-configuration-dialog/add-configuration-dialog.component';
import { AddWebHookDialogComponent } from '../dialogs/add-web-hook-dialog/add-web-hook-dialog.component';

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

    async addConfiguration(viewRef, onConfirm) {
        this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('Please enter a configuration setting'),
            childComponent: AddConfigurationDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('Save'), buttonClass: 'btn btn-primary', onAction: () => {
                    const data = this.modalParameterService.getModalParameter('configuration_data');
                    onConfirm(data);
                    return true;
                }}
            ],
            data: {
                key: 'configuration_data'
            }
        });
    }

    async addWebHook(viewRef, onConfirm) {
        this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('Create New Web Hook'),
            childComponent: AddWebHookDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('Create Web Hook'), buttonClass: 'btn btn-primary', onAction: () => {
                    const data = this.modalParameterService.getModalParameter('webhook_data');
                    if (data && data.url && data.event_types.length > 0) {
                        onConfirm(data);
                        return true;
                    }
                }}
            ],
            data: {
                key: 'webhook_data'
            }
        });
    }

    async addUser(viewRef, onConfirm) {
        this.modalDialogService.openDialog(viewRef, {
            title: await this.wordTranslateService.translate('Invite User'),
            childComponent: AddUserDialogComponent,
            actionButtons: [
                { text: await this.wordTranslateService.translate('Cancel'), buttonClass: 'btn btn-default', onAction: () => true },
                { text: await this.wordTranslateService.translate('Invite User'), buttonClass: 'btn btn-primary', onAction: () => {
                    onConfirm(this.modalParameterService.getModalParameter('user_email'));
                    return true;
                }}
            ],
            data: {
                key: 'user_email'
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
