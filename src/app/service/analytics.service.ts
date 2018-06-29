import {Injectable} from '@angular/core';
import {NgxAnalytics} from 'ngx-analytics';
import {Locker, DRIVERS} from 'angular-safeguard';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    constructor(
        private locker: Locker,
        private ngxAnalytics: NgxAnalytics
    ) {
        this.locker.setDriverFallback(DRIVERS.SESSION);
        this.locker.setNamespace('analytics');
    }

    addPaymentInfo() {
        return this.ngxAnalytics.eventTrack.next({
            action: 'AddPaymentInfo',
            properties: { category: 'AddPaymentInfo' },
        });
    }

    completeRegistration(queryString) {
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

            this.locker.set(DRIVERS.SESSION, 'registration', data);
        }

        return this.ngxAnalytics.eventTrack.next({
            action: 'CompleteRegistration',
            properties: data
        });
    }

    getRegistrationQueryStringData() {
        return this.locker.get(DRIVERS.LOCAL, 'registration') || {};
    }

    initiateCheckout() {
        return this.ngxAnalytics.eventTrack.next({
            action: 'InitiateCheckout'
        });
    }

    lead(data) {
        return this.ngxAnalytics.eventTrack.next({
            action: 'Lead',
            properties: data,
        });
    }

    purchase(data) {
        return this.ngxAnalytics.eventTrack.next({
            action: 'Purchase',
            properties: data,
        });
    }
}
