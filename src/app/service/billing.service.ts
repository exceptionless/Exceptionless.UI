import { Injectable } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { DialogService } from './dialog.service';

@Injectable({
    providedIn: 'root'
})

export class BillingService {
    constructor(
        private analyticsService: AnalyticsService,
        private dialogService: DialogService
    ) {}

    async changePlan(viewRef, organizationId?) {
        this.analyticsService.initiateCheckout();
        return this.dialogService.changePlan(viewRef, organizationId, () => {
            return true;
        });
    }

    async confirmUpgradePlan(viewRef, message, organizationId) {
        return this.dialogService.confirm(viewRef, message, 'Upgrade Plan', () => {
            return this.changePlan(viewRef, organizationId);
        });
    }

}
