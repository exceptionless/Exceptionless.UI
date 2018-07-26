import { Injectable } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Injectable({
    providedIn: 'root'
})

export class BillingService {

    constructor(
        private analyticsService: AnalyticsService
    ) {
    }

    changePlan(organizationId) {
        this.analyticsService.initiateCheckout();

        /*return dialogs.create('components/billing/change-plan-dialog.tpl.html', 'ChangePlanDialog as vm', organizationId).result;*/
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
