import { Injectable, ViewContainerRef } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { ChangePlanDialogComponent } from '../dialogs/change-plan-dialog/change-plan-dialog.component';
import { ModalDialogService } from 'ngx-modal-dialog';

@Injectable({
    providedIn: 'root'
})

export class BillingService {
    constructor(
        private analyticsService: AnalyticsService,
        private modalDialogService: ModalDialogService,
        private viewRef: ViewContainerRef,
    ) {}

    changePlan(organizationId?) {
        this.analyticsService.initiateCheckout();

        /*return dialogs.create('components/billing/change-plan-dialog.tpl.html', 'ChangePlanDialog as vm', organizationId).result;*/
        const modalCallBackFunction = () => {
            console.log('I am here');
        };

        return this.modalDialogService.openDialog(this.viewRef, {
            title: 'DIALOGS_CONFIRMATION',
            childComponent: ChangePlanDialogComponent,
            actionButtons: [
                { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
                { text: 'DELETE ACCOUNT', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete your account?'
            }
        });
    }

    confirmUpgradePlan(message, organizationId) {
        const onSuccess = () => {
            return this.changePlan(organizationId);
        };

        const onFailure = () => {
            return null;
        };

        /*return dialogService.confirm(message, 'Upgrade Plan').then(onSuccess, onFailure);*/
    }

}
