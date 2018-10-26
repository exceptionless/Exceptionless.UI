import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { StatusService } from '../../service/status.service';
import { WordTranslateService } from '../../service/word-translate.service';
import { AuthService } from 'ng2-ui-auth';
import { StateService } from '../../service/state.service';
import { timer } from 'rxjs';

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.less']
})
export class StatusComponent implements OnInit, OnDestroy {

    _lastChecked: any = moment();
    _message: any;
    _redirect: any;
    contactSupport = '';

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private statusService: StatusService,
        private wordTranslateService: WordTranslateService,
        private authService: AuthService,
        private stateService: StateService
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            this._redirect = params['redirect'] ? (params['redirect'] === 'true') : false;
        });
    }

    ngOnInit() {
        this.initData();
        timer(0, 30 * 1000).subscribe(val => {
            this.updateStatus();
        });
    }

    ngOnDestroy() {
    }

    async initData() {
        this.contactSupport = await this.wordTranslateService.translate('Please contact support for more information.');
        this._message = await this.getMessage();
        console.log(this._message);
    }

    async updateStatus() {
        const updateMessage = (response) => {
            if (response && response.data && response.data.message) {
                this._message = response.data.message;
                if (response.status !== 200) {
                    this._message += ' ' + this.contactSupport;
                }
            } else {
                this._message = '';
            }
        };

        const onSuccess = (response) => {
            if (this._redirect && moment().diff(this._lastChecked, 'seconds') > 30) {
                if (!this.authService.isAuthenticated()) {
                    return this.router.navigate(['/login']);
                }

                return this.stateService.restore();
            }


            return updateMessage(response);
        };

        try {
            const res = await this.statusService.get();
            onSuccess(res);
        } catch (err) {
            updateMessage(err);
        }
    }

    async getMessage() {
        const underMaintenance = await this.wordTranslateService.translate('We\'re sorry but the website is currently undergoing maintenance.');

        if (this._redirect) {
            return underMaintenance + ' ' + await this.wordTranslateService.translate('You’ll be automatically redirected when the maintenance is completed.') + ' ' + this.contactSupport;
        }

        return underMaintenance + ' ' + this.contactSupport;
    }
}
