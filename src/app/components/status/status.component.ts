import { Component, OnInit, OnDestroy } from "@angular/core";
import * as moment from "moment";
import { Router, ActivatedRoute } from "@angular/router";
import { StatusService } from "../../service/status.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { AuthService } from "ng2-ui-auth";
import { StateService } from "../../service/state.service";
import { timer } from "rxjs";
import { AboutResult } from "src/app/models/network";

@Component({
    selector: "app-status",
    templateUrl: "./status.component.html",
    styleUrls: ["./status.component.less"]
})
export class StatusComponent implements OnInit {
    private _lastChecked: moment.Moment = moment();
    private _redirect: boolean;
    private contactSupport: string;
    public message: string;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private statusService: StatusService,
        private wordTranslateService: WordTranslateService,
        private authService: AuthService,
        private stateService: StateService
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            this._redirect = params.redirect ? (params.redirect === "true") : false;
        });
    }

    public async ngOnInit() {
        this.contactSupport = await this.wordTranslateService.translate("Please contact support for more information.");
        this.message = await this.getMessage();

        timer(0, 30 * 1000).subscribe(val => { // TODO: I notice we subscribe in a lot of places. Are we destorying these subscriptions everywhere?
            this.updateStatus();
        });
    }

    private async updateStatus() {
        const updateMessage = (response?: AboutResult) => { // TODO: This needs to pull a message from the healthy end point and NOT the about end point.
            if (response && response.data && response.data.message) {
                this.message = response.data.message;
                if (response.status !== 200) {
                    this.message += " " + this.contactSupport;
                }
            } else {
                this.message = "";
            }
        };

        try {
            const response: any = await this.statusService.get();
            if (this._redirect && moment().diff(this._lastChecked, "seconds") > 30) {
                if (!this.authService.isAuthenticated()) {
                    return this.router.navigate(["/login"]);
                }

                return this.stateService.restore();
            }

            updateMessage(response);
        } catch (ex) {
            updateMessage();
        }
    }

    // TODO: This should be using es6 string interpolation.
    private async getMessage() {
        const underMaintenance = await this.wordTranslateService.translate("We're sorry but the website is currently undergoing maintenance.");

        if (this._redirect) {
            return underMaintenance + " " + await this.wordTranslateService.translate("You'll be automatically redirected when the maintenance is completed.") + " " + this.contactSupport;
        }

        return underMaintenance + " " + this.contactSupport;
    }
}
