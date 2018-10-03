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

    async changePlan(viewRef, callback, organizationId?) {
        this.analyticsService.initiateCheckout();
        return this.dialogService.changePlan(viewRef, organizationId, () => {
            return callback;
        });
    }

    async confirmUpgradePlan(viewRef, message, organizationId, callback) {
        return this.dialogService.confirm(viewRef, message, 'Upgrade Plan', () => {
            return this.changePlan(viewRef, callback, organizationId);
        });
    }

}
