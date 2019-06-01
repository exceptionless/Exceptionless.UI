import { Injectable } from "@angular/core";
import { Angulartics2 } from "angulartics2";
import { Locker, DRIVERS } from "angular-safeguard";

@Injectable({ providedIn: "root" })
export class AnalyticsService {
    constructor(
        private locker: Locker,
        private analytics: Angulartics2
    ) {
        this.locker.setDriverFallback(DRIVERS.SESSION);
        this.locker.setNamespace("analytics");
    }

    public addPaymentInfo() {
        return this.analytics.eventTrack.next({
            action: "AddPaymentInfo",
            properties: { category: "AddPaymentInfo" },
        });
    }

    public completeRegistration(queryString) {
        let data = {};
        if (queryString && (queryString.domain || queryString.medium || queryString.type || queryString.campaign || queryString.content || queryString.keyword)) {
            data = {
                marketing_domain: queryString.domain,
                marketing_medium: queryString.medium,
                marketing_type: queryString.type,
                marketing_campaign: queryString.campaign,
                marketing_content: queryString.content,
                marketing_keyword: queryString.keyword
            };

            this.locker.set(DRIVERS.SESSION, "registration", data);
        }

        return this.analytics.eventTrack.next({
            action: "CompleteRegistration",
            properties: data
        });
    }

    public getRegistrationQueryStringData() {
        return this.locker.get(DRIVERS.LOCAL, "registration") || {};
    }

    public initiateCheckout() {
        return this.analytics.eventTrack.next({
            action: "InitiateCheckout"
        });
    }

    public lead(data) {
        return this.analytics.eventTrack.next({
            action: "Lead",
            properties: data,
        });
    }

    public purchase(data) {
        return this.analytics.eventTrack.next({
            action: "Purchase",
            properties: data,
        });
    }
}
