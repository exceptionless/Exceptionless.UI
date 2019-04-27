import { Component, ComponentRef } from "@angular/core";
import { IModalDialog, IModalDialogOptions } from "ngx-modal-dialog";
import { OrganizationService } from "../../service/organization.service";
import { NotificationService } from "../../service/notification.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { UserService } from "../../service/user.service";
import { Intercom } from "ng-intercom";
import { AnalyticsService } from "../../service/analytics.service";
import { Element as StripeElement, ElementOptions, ElementsOptions, StripeService, CardDataOptions, Token } from "@nomadreservations/ngx-stripe";
import { CommonService } from "../../service/common.service";
import { AppEventService } from "../../service/app-event.service";
import { Organization, BillingPlan } from "src/app/models/organization";
import { TypedMessage } from "src/app/models/messaging";
import { CurrentUser } from "src/app/models/user";

interface StripeCard {
    name: string;
    mode: "new" | "existing";
    expiry: string;
}

@Component({
    selector: "app-change-plan-dialog",
    templateUrl: "./change-plan-dialog.component.html"
})

export class ChangePlanDialogComponent implements IModalDialog {
    public organizations: Organization[];
    public currentOrganization: Organization;
    public plans: BillingPlan[];
    private currentPlan: BillingPlan;
    public card: StripeCard;
    private user: CurrentUser;
    private organizationId;
    private _contactSupport;
    public paymentMessage;
    public coupon: string;
    private _freePlanId = "EX_FREE";
    private saveEvent: any;
    private closeEvent: any;
    public currentOrganizationId: string;
    public currentPlanId: string;

    public error: string;
    private element: StripeElement;
    public cardOptions: ElementOptions = {
        style: {
            base: {
                iconColor: "#276fd3",
                color: "#31325F",
                lineHeight: "40px",
                fontWeight: 300,
                fontFamily: "\"Helvetica Neue\", Helvetica, sans-serif",
                fontSize: "18px",
                "::placeholder": {
                    color: "#CFD7E0"
                }
            }
        }
    };
    public elementsOptions: ElementsOptions = {
        locale: "en"
    };

    constructor(
        private organizationService: OrganizationService,
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private intercom: Intercom,
        private userService: UserService,
        private stripe: StripeService,
        private commonService: CommonService,
        private appEvent: AppEventService,
        private analyticsService: AnalyticsService) {

        this.stripe.changeKey(environment.STRIPE_PUBLISHABLE_KEY);
    }

    // TODO: Seems like we are doing async http requests in dialog init and NgOnInit...
    public async dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        this.organizationId = options.data.organizationId;
        this.saveEvent = options.data.saveEvent;
        this.closeEvent = options.data.closeEvent;
        this.saveEvent.subscribe(this.save.bind(this));

        this._contactSupport = await this.wordTranslateService.translate("Please contact support for more information.");
        this.paymentMessage = !this.isBillingEnabled() ? await this.wordTranslateService.translate("Billing is currently disabled.") : null;

        if (this.isIntercomEnabled()) {
            this.intercom.boot({
                app_id: environment.INTERCOM_APPID
            });
        }

        this.appEvent.subscribe({
            next: (event: TypedMessage) => {
                if (event.type === "change_plan_form_submitted") { // TODO: Where is this message type coming from?
                    this.save(true);
                }
            }
        });

        try {
            await this.getOrganizations();
            await this.getPlans();
            await this.getUser();
        } catch (ex) {}
    }

    async save(isValid) {
        const onSuccess = async (response) => {
            if (!response.success) {
                this.analyticsService.lead(this.getAnalyticsData());
                this.paymentMessage = await this.wordTranslateService.translate("An error occurred while changing plans.") + " " + await this.wordTranslateService.translate("Message:") + " " + response.message;
                return;
            }

            this.analyticsService.purchase(this.getAnalyticsData());

            this.saveEvent.emit(this.currentPlan);
            this.notificationService.success("", await this.wordTranslateService.translate("Thanks! Your billing plan has been successfully changed."));
            this.closeEvent.emit();
        };

        const onFailure = async (response) => {
            if (response.error && response.error.message) {
                this.paymentMessage = response.error.message;
            } else {
                this.paymentMessage = await this.wordTranslateService.translate("An error occurred while changing plans.");
            }

            this.analyticsService.lead(this.getAnalyticsData());
        };

        const onCreateTokenSuccess = async (response) => {
            try {
                const res = await this.changePlan(false, { stripeToken: response.id, last4: response.card.last4, couponId: this.coupon });
                onSuccess(res);
            } catch (ex) {
                onFailure(ex);
            }
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
            } catch (ex) {
                onFailure(ex);
            }
        }

        if (this.currentPlan.price > 0 && this.isNewCard()) {
            try {
                const res = await this.createStripeToken();
                console.log(res);
                onCreateTokenSuccess(res);
                return res;
            } catch (ex) {
                onFailure(ex);
                this.paymentMessage = await this.wordTranslateService.translate("An error occurred while changing plans.");
                return ex;
            }
        }

        try {
            const res = await this.changePlan(false, { couponId: this.coupon });
            onSuccess(res);
        } catch (ex) {
            onFailure(ex);
        }
    }

    private async createStripeToken(): Promise<Token> {
        // TODO: Confirm we don't need expiration by looking at old code base.
        const expiration = this.commonService.parseExpiry(this.card.expiry);
        const data: CardDataOptions = { name: this.card.name,  };

        const response = await this.stripe.createToken(this.element, data).toPromise();
        this.analyticsService.addPaymentInfo();
        return response.token;
    }

    public cardUpdated(result) {
        this.element = result.element;
        this.error = null;
    }

    private cancel() {
        this.analyticsService.lead(this.getAnalyticsData());
        this.closeEvent.emit();
    }

    private getAnalyticsData() {
        return {
            content_name: this.currentPlan.name,
            content_ids: [this.currentPlan.id],
            content_type: "product",
            currency: "USD",
            value: this.currentPlan.price
        };
    }

    private async changePlan(isAdmin: boolean, options: any) {
        if (isAdmin) {
            return this.userService.adminChangePlan(this.currentOrganization.id, this.currentPlan.id);
        } else {
            return this.organizationService.changePlan(this.currentOrganization.id, Object.assign({}, { planId: this.currentPlan.id }, options));
        }
    }

    private isIntercomEnabled() {
        return !!environment.INTERCOM_APPID;
    }

    public isBillingEnabled() {
        return !!environment.STRIPE_PUBLISHABLE_KEY;
    }

    public isCancellingPlan() {
        return this.currentPlan && this.currentPlan.id === this._freePlanId && this.currentOrganization.plan_id !== this._freePlanId;
    }

    public isPaidPlan() {
        return this.currentPlan && this.currentPlan.price !== 0;
    }

    public hasAdminRole() {
        return this.userService.hasAdminRole(this.user);
    }

    private isNewCard() {
        return this.card && this.card.mode === "new";
    }

    public hasExistingCard() {
        return !!this.currentOrganization.card_last4;
    }

    public changeOrganization(newOrganizationId: string) {
        this.card.mode = this.hasExistingCard() ? "existing" : "new";
        this.currentOrganization = this.organizations.filter((o) => o.id === newOrganizationId )[0];
        return this.getPlans();
    }

    public changePlanObject(newPlanId: string) {
        this.currentPlan = this.plans.filter((p) => p.id === newPlanId)[0] || this.plans[0];
    }

    public showIntercom() {
        this.intercom.showNewMessage();
    }

    private async getUser() {
        try {
            this.user = await this.userService.getCurrentUser();
            if (!this.card.name) {
                this.card.name = this.user.full_name;
            }
        } catch (ex) {
            this.notificationService.error("", `${await this.wordTranslateService.translate("An error occurred while loading your user account.")} ${this._contactSupport}`);
            this.cancel();
        }
    }

    private async getPlans() {
        try {
            this.plans = await this.organizationService.getPlans(this.currentOrganization.id);

            // Upsell to the next plan.
            const currentPlan = this.plans.filter((p) => p.id === this.currentOrganization.plan_id)[0] || this.plans[0];
            const currentPlanIndex = this.plans.indexOf(currentPlan);
            this.currentPlan = this.plans.length > currentPlanIndex + 1 ? this.plans[currentPlanIndex + 1] : currentPlan;
            this.currentPlanId = this.currentPlan.id;
        } catch (ex) {
            this.notificationService.error("", `${await this.wordTranslateService.translate("An error occurred while loading available billing plans.")} ${this._contactSupport}`);
            this.cancel();
        }
    }

    private async getOrganizations() {
        const getSelectedOrganization = async () => {
            if (!this.organizationId || this.organizations.filter((o) => o.id === this.organizationId )[0]) {
                return;
            }

            const organization = await this.organizationService.getById(this.organizationId);
            this.organizations.push(organization);
        };

        this.organizations = [];
        try {
            this.organizations = await this.organizationService.getAll();
            await getSelectedOrganization();

            this.currentOrganization = this.organizations.filter((o) => o.id === (this.currentOrganization.id || this.organizationId) )[0];
            if (!this.currentOrganization &&  this.organizations.length > 0) {
                this.currentOrganization = this.organizations[0];
            }

            this.currentOrganizationId = this.currentOrganization.id;
            this.card.mode = this.hasExistingCard() ? "existing" : "new";
        } catch (ex) {
            this.notificationService.error("", `${await this.wordTranslateService.translate("An error occurred while loading your organizations.")} ${this._contactSupport}`);
            this.cancel();
        }
    }
}
