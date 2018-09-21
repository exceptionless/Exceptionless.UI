import { Component, ComponentRef } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';
import { OrganizationService } from '../../service/organization.service';
import { NotificationService } from '../../service/notification.service';
import { WordTranslateService } from '../../service/word-translate.service';
import { UserService } from '../../service/user.service';
import { GlobalVariables } from '../../global-variables';
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

    constructor(
        private organizationService: OrganizationService,
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private _globalVariables: GlobalVariables,
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
        this.saveEvent.subscribe(this.save);
        this.init();
    }

    async init() {
        this._contactSupport = await this.wordTranslateService.translate('Please contact support for more information.');
        this.paymentMessage = !this.isBillingEnabled() ? await this.wordTranslateService.translate('Billing is currently disabled.') : null;

        if (this.isIntercomEnabled()) {
            this.intercom.boot({
                app_id: this._globalVariables.INTERCOM_APPID
            });
        }

        this.getOrganizations().then(this.getPlans).then(this.getUser);
    }

    async save(isValid) {
        const onCreateTokenSuccess = (response) => {
            return this.changePlan(false, { stripeToken: response.id, last4: response.card.last4, couponId: this.coupon }).then(onSuccess, onFailure);
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
            return this.changePlan(this.hasAdminRole(), {}).then(onSuccess, onFailure);
        }

        if (this.currentPlan.price > 0 && this.isNewCard()) {
            try {
                return this.createStripeToken().then(onCreateTokenSuccess, onFailure);
            } catch (error) {
                this.paymentMessage = await this.wordTranslateService.translate('An error occurred while changing plans.');
                return null;
            }
        }

        return this.changePlan(false, { couponId: this.coupon }).then(onSuccess, onFailure);
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

        return this.stripe.createToken(this.elements.create('card', {}), payload).toPromise().then(onSuccess);
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
        return !!this._globalVariables.INTERCOM_APPID;
    }

    isBillingEnabled() {
        return !!this._globalVariables.STRIPE_PUBLISHABLE_KEY;
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

    changeOrganization() {
        this.card.mode = this.hasExistingCard() ? 'existing' : 'new';
        return this.getPlans();
    }

    showIntercom() {
        this.intercom.showNewMessage();
    }

    getUser() {
        const onSuccess = (response) => {
            this.user = response.data.plain();

            if (!this.card.name) {
                this.card.name = this.user.full_name;
            }

            return this.user;
        };

        const onFailure = async (response) => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading your user account.') + ' ' + this._contactSupport);
            this.cancel();
        };

        return this.userService.getCurrentUser().toPromise().then(onSuccess, onFailure);
    }

    async getPlans() {
        const onSuccess = (response) => {
            this.plans = response.data.plain();

            // Upsell to the next plan.
            const currentPlan = this.plans.filter((p) => p.id === this.currentOrganization.plan_id)[0] || this.plans[0];
            const currentPlanIndex = this.plans.indexOf(currentPlan);
            this.currentPlan = this.plans.length > currentPlanIndex + 1 ? this.plans[currentPlanIndex + 1] : currentPlan;

            return this.plans;
        };

        const onFailure = async (response) => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading available billing plans.') + ' ' + this._contactSupport);
            this.cancel();
        };

        return this.organizationService.getPlans(this.currentOrganization.id).toPromise().then(onSuccess, onFailure);
    }

    async getOrganizations() {
        const getSelectedOrganization = async () => {
            const onSucceed = resp => {
                this.organizations.push(resp.data.plain());
                return this.organizations;
            };

            if (!this.organizationId || this.organizations.filter((o) => o.id === this.organizationId )[0]) {
                return;
            }

            return this.organizationService.getById(this.organizationId).toPromise().then(onSucceed);
        };

        const getAllOrganizations = async () => {
            const onSucceed = resp => {
                resp.data.plain().forEach((value, key) => {
                    this.organizations.push(value);
                });
                return this.organizations;
            };

            return this.organizationService.getAll({}).toPromise().then(onSucceed);
        };

        const onSuccess = () => {
            this.currentOrganization = this.organizations.filter((o) => o.id === (this.currentOrganization.id || this.organizationId) )[0];
            if (!this.currentOrganization) {
                this.currentOrganization = this.organizations.length > 0 ? this.organizations[0] : {};
            }

            this.card.mode = this.hasExistingCard() ? 'existing' : 'new';
        };

        const onFailure = async (response) => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading your organizations.') + ' ' + this._contactSupport);
            this.cancel();
        };

        this.organizations = [];
        return getAllOrganizations().then(getSelectedOrganization).then(onSuccess, onFailure);
    }

}
