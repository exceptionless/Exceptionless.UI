import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';
import { OrganizationService } from '../../service/organization.service';
import { NotificationService } from '../../service/notification.service';
import { WordTranslateService } from '../../service/word-translate.service';
import { UserService } from '../../service/user.service';
import { environment } from '../../../environments/environment';
import { Intercom } from 'ng-intercom';
import { AnalyticsService } from '../../service/analytics.service';
import { StripeService, Elements } from 'ngx-stripe';
import { CommonService } from '../../service/common.service';

@Component({
    selector: 'app-change-plan-dialog',
    templateUrl: './change-plan-dialog.component.html'
})

export class ChangePlanDialogComponent implements IModalDialog {
    organizations: any[];
    currentOrganization: any = {};
    plans: any[];
    currentPlan: any = {};
    card: any = {};
    user: any = {};
    organizationId = '';
    _contactSupport = '';
    paymentMessage = '';
    coupon = null;
    _freePlanId = 'EX_FREE';
    saveEvent: any;
    closeEvent: any;
    elements: Elements;
    currentOrganizationId = '';
    currentPlanId = '';

    constructor(
        private organizationService: OrganizationService,
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private intercom: Intercom,
        private userService: UserService,
        private stripe: StripeService,
        private commonService: CommonService,
        private analyticsService: AnalyticsService) {
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
        this.organizationId = options.data['organizationId'];
        this.saveEvent = options.data['saveEvent'];
        this.closeEvent = options.data['closeEvent'];
        this.saveEvent.subscribe(this.save.bind(this));
        this.init();
    }

    async init() {
        this._contactSupport = await this.wordTranslateService.translate('Please contact support for more information.');
        this.paymentMessage = !this.isBillingEnabled() ? await this.wordTranslateService.translate('Billing is currently disabled.') : null;

        if (this.isIntercomEnabled()) {
            this.intercom.boot({
                app_id: environment.INTERCOM_APPID
            });
        }

        try {
            await this.getOrganizations();
            await this.getPlans.bind(this);
            await this.getUser.bind(this);
        } catch (err) {}
    }

    async save(isValid) {
        const onCreateTokenSuccess = async (response) => {
            try {
                const res = await this.changePlan(false, { stripeToken: response.id, last4: response.card.last4, couponId: this.coupon });
                onSuccess(res);
            } catch (err) {
                onFailure(err);
            }
        };

        const onSuccess = async (response) => {
            if (!response.data.success) {
                this.analyticsService.lead(this.getAnalyticsData());
                this.paymentMessage = await this.wordTranslateService.translate('An error occurred while changing plans.') + ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.data.message;
                return;
            }

            this.analyticsService.purchase(this.getAnalyticsData());

            this.saveEvent.emit(this.currentPlan);
            this.notificationService.success('', await this.wordTranslateService.translate('Thanks! Your billing plan has been successfully changed.'));
        };

        const onFailure = async (response) => {
            if (response.error && response.error.message) {
                this.paymentMessage = response.error.message;
            } else {
                this.paymentMessage = await this.wordTranslateService.translate('An error occurred while changing plans.');
            }

            this.analyticsService.lead(this.getAnalyticsData());
        };

        if (!isValid || !this.currentPlan) {
            return;
        }

        this.paymentMessage = null;
        if (this.currentOrganization.plan_id === this._freePlanId && this.currentPlan.id === this._freePlanId) {
            this.cancel();
            return;
        }

        if (this.hasAdminRole() || this.currentPlan.id === this._freePlanId) {
            try {
                const res = await this.changePlan(this.hasAdminRole(), {});
                onSuccess(res);
            } catch (err) {
                onFailure(err);
            }
        }

        if (this.currentPlan.price > 0 && this.isNewCard()) {
            try {
                const res = await this.createStripeToken();
                onCreateTokenSuccess(res);
                return res;
            } catch (err) {
                onFailure(err);
                this.paymentMessage = await this.wordTranslateService.translate('An error occurred while changing plans.');
                return err;
            }
        }

        try {
            const res = await this.changePlan(false, { couponId: this.coupon });
            onSuccess(res);
        } catch (err) {
            onFailure(err);
        }
    }

    async createStripeToken() {
        const onSuccess = (response) => {
            this.analyticsService.addPaymentInfo();
            return response;
        };

        const expiration = this.commonService.parseExpiry(this.card.expiry);
        const payload = {
            number: this.card.number,
            cvc: this.card.cvc,
            exp_month: expiration.month,
            exp_year: expiration.year,
            name: this.card.name
        };

        try {
            const res = await this.stripe.createToken(this.elements.create('card', {}), payload).toPromise();
            onSuccess(res);
        } catch (err) {}
    }

    cancel() {
        this.analyticsService.lead(this.getAnalyticsData());
        this.closeEvent.emit();
    }

    getAnalyticsData() {
        return { content_name: this.currentPlan.name, content_ids: [this.currentPlan.id], content_type: 'product', currency: 'USD', value: this.currentPlan.price };
    }

    async changePlan(isAdmin, options) {
        if (isAdmin) {
            return this.userService.adminChangePlan({ organizationId: this.currentOrganization.id, planId: this.currentPlan.id }).toPromise();
        } else {
            return this.organizationService.changePlan(this.currentOrganization.id, Object.assign({}, { planId: this.currentPlan.id }, options)).toPromise();
        }
    }

    isIntercomEnabled() {
        return !!environment.INTERCOM_APPID;
    }

    isBillingEnabled() {
        return !!environment.STRIPE_PUBLISHABLE_KEY;
    }

    isCancellingPlan() {
        return this.currentPlan && this.currentPlan.id === this._freePlanId && this.currentOrganization.plan_id !== this._freePlanId;
    }

    isPaidPlan() {
        return this.currentPlan && this.currentPlan.price !== 0;
    }

    hasAdminRole() {
        return this.userService.hasAdminRole(this.user);
    }

    isNewCard() {
        return this.card && this.card.mode === 'new';
    }

    hasExistingCard() {
        return !!this.currentOrganization.card_last4;
    }

    changeOrganization(newId) {
        this.card.mode = this.hasExistingCard() ? 'existing' : 'new';
        this.currentOrganization = this.organizations.filter((o) => o.id === newId )[0];
        return this.getPlans();
    }

    changePlanObject(newId) {
        this.currentPlan = this.plans.filter((p) => p.id === newId)[0] || this.plans[0];
    }

    showIntercom() {
        this.intercom.showNewMessage();
    }

    async getUser() {
        const onSuccess = (response) => {
            this.user = response;

            if (!this.card.name) {
                this.card.name = this.user.full_name;
            }

            return this.user;
        };

        const onFailure = async (response) => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading your user account.') + ' ' + this._contactSupport);
            this.cancel();
        };

        try {
            const res = await this.userService.getCurrentUser().toPromise();
            return onSuccess(res);
        } catch (err) {
            return onFailure(err);
        }
    }

    async getPlans() {
        const onSuccess = (response) => {
            this.plans = response;

            // Upsell to the next plan.
            const currentPlan = this.plans.filter((p) => p.id === this.currentOrganization.plan_id)[0] || this.plans[0];
            const currentPlanIndex = this.plans.indexOf(currentPlan);
            this.currentPlan = this.plans.length > currentPlanIndex + 1 ? this.plans[currentPlanIndex + 1] : currentPlan;
            this.currentPlanId = this.currentPlan.id;
            return this.plans;
        };

        const onFailure = async (response) => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading available billing plans.') + ' ' + this._contactSupport);
            this.cancel();
        };

        try {
            const res = await this.organizationService.getPlans(this.currentOrganization.id).toPromise();
            return onSuccess(res);
        } catch (err) {
            return onFailure(err);
        }
    }

    async getOrganizations() {
        const getSelectedOrganization = async () => {
            const onSucceed = resp => {
                this.organizations.push(resp);
                return this.organizations;
            };

            if (!this.organizationId || this.organizations.filter((o) => o.id === this.organizationId )[0]) {
                return;
            }

            const response = await this.organizationService.getById(this.organizationId).toPromise();
            return onSucceed(response['body']);
        };

        const getAllOrganizations = async () => {
            const onSucceed = resp => {
                resp.forEach((value, key) => {
                    this.organizations.push(value);
                });
                return this.organizations;
            };

            const response = await this.organizationService.getAll({}).toPromise();
            return onSucceed(response['body']);
        };

        const onSuccess = () => {
            this.currentOrganization = this.organizations.filter((o) => o.id === (this.currentOrganization.id || this.organizationId) )[0];
            if (!this.currentOrganization) {
                this.currentOrganization = this.organizations.length > 0 ? this.organizations[0] : {};
            }
            this.currentOrganizationId = this.currentOrganization.id;
            this.card.mode = this.hasExistingCard() ? 'existing' : 'new';
        };

        const onFailure = async (response) => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading your organizations.') + ' ' + this._contactSupport);
            this.cancel();
        };

        this.organizations = [];

        try {
            await getAllOrganizations();
            await getSelectedOrganization;
            onSuccess();
        } catch (err) {
            onFailure(err);
        }
    }

}
