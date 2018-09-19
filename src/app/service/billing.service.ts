import { Injectable } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { ChangePlanDialogComponent } from '../dialogs/change-plan-dialog/change-plan-dialog.component';
import { ModalDialogService } from 'ngx-modal-dialog';
import { DialogService } from './dialog.service';

@Injectable({
    providedIn: 'root'
})

export class BillingService {
    constructor(
        private analyticsService: AnalyticsService,
        private modalDialogService: ModalDialogService,
        private dialogService: DialogService
    ) {}

    changePlan(organizationId?) {
        this.analyticsService.initiateCheckout();

        /*return dialogs.create('components/billing/change-plan-dialog.tpl.html', 'ChangePlanDialog as vm', organizationId).result;*/
        const modalCallBackFunction = () => {
        };

        /*return this.modalDialogService.openDialog(this.viewRef, {
            title: 'DIALOGS_CONFIRMATION',
            childComponent: ChangePlanDialogComponent,
            actionButtons: [
                { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
                { text: 'DELETE ACCOUNT', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete your account?'
            }
        });*/

        return true;
    }

    confirmUpgradePlan(viewRef, message, organizationId) {
        return new Promise((resolve, reject) => {
            this.dialogService.confirm(viewRef, message, 'Upgrade Plan', () => {
                resolve(this.changePlan(organizationId));
            });
        });
    }

}
