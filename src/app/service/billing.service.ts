import { Injectable } from "@angular/core";
import { AnalyticsService } from "./analytics.service";
import { DialogService } from "./dialog.service";
import { $ExceptionlessClient } from "../exceptionlessclient";

@Injectable({
    providedIn: "root"
})

export class BillingService {

    private source = "exceptionless.billing.billingService";

    constructor(
        private analyticsService: AnalyticsService,
        private dialogService: DialogService
    ) {}

    public async changePlan(viewRef, callback, organizationId?) {
        this.analyticsService.initiateCheckout();
        $ExceptionlessClient.createFeatureUsage(`${this.source}.changePlan`)
            .setProperty("OrganizationId", organizationId)
            .submit();

        return this.dialogService.changePlan(viewRef, organizationId, () => {
            return callback;
        });
    }

    public async confirmUpgradePlan(viewRef, message, organizationId, callback) {
        $ExceptionlessClient.createFeatureUsage(`${this.source}.confirmUpgradePlan`)
            .setMessage(message)
            .setProperty("OrganizationId", organizationId)
            .submit();

        return this.dialogService.confirm(viewRef, message, "Upgrade Plan", () => {
            return this.changePlan(viewRef, callback, organizationId);
        }, () => {
            $ExceptionlessClient.createFeatureUsage(`${this.source}.confirmUpgradePlan.cancel`)
                .setMessage(message)
                .setProperty("OrganizationId", organizationId)
                .submit();
        });
    }

}
