import { Component, OnInit } from '@angular/core';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from './service/app-config.service';
import { StripeService } from 'ngx-stripe';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
    constructor(
        private hotkeysService: HotkeysService,
        private router: Router,
        public translateService: TranslateService,
        private appConfig: AppConfigService,
        private stripeService: StripeService
    ) {}

    ngOnInit() {
        this.addHotKeys();
        this.translateService.addLangs(['en-us', 'zh-cn']);
        this.translateService.setDefaultLang('en-us');

        const browserLang = this.translateService.getBrowserLang();
        this.translateService.use(browserLang.match(/en-us|zh-cn/) ? browserLang : 'en-us');
        this.stripeService.changeKey(this.appConfig.config.STRIPE_PUBLISHABLE_KEY);
    }

    addHotKeys() {
        this.hotkeysService.add(new Hotkey('c', (event: KeyboardEvent): boolean => {
            this.showIntercom();
            return false;
        }, null, 'Chat with Support'));

        this.hotkeysService.add(new Hotkey('g w', (event: KeyboardEvent): boolean => {
            window.open('https://github.com/exceptionless/Exceptionless/wiki', '_blank');
            return false;
        }, null, 'Go To Documentation'));

        this.hotkeysService.add(new Hotkey('s', (event: KeyboardEvent): boolean => {
            console.log('hotkey-s');
            document.getElementById('search').focus();
            return false;
        }, null, 'Focus Search Bar'));

        this.hotkeysService.add(new Hotkey('g a', (event: KeyboardEvent): boolean => {
            this.router.navigate(['/account/manage'], { queryParams: { tab: 'general' } });
            return false;
        }, null, 'Go To My Account'));

        this.hotkeysService.add(new Hotkey('g n', (event: KeyboardEvent): boolean => {
            this.router.navigate(['/account/manage'], { queryParams: { tab: 'notifications' } });
            return false;
        }, null, 'Go To Notifications'));

        this.hotkeysService.add(new Hotkey('g d', (event: KeyboardEvent): boolean => {
            this.router.navigate(['/dashboard']);
            return false;
        }, null, 'Go To Dashboard'));

        this.hotkeysService.add(new Hotkey('g o', (event: KeyboardEvent): boolean => {
            this.router.navigate(['/organization/list']);
            return false;
        }, null, 'Go To Organizations'));

        this.hotkeysService.add(new Hotkey('g p', (event: KeyboardEvent): boolean => {
            this.router.navigate(['/project/list']);
            return false;
        }, null, 'Go To Projects'));

        this.hotkeysService.add(new Hotkey('g g', (event: KeyboardEvent): boolean => {
            window.open('https://github.com/exceptionless/Exceptionless', '_blank');
            return false;
        }, null, 'Go To GitHub project'));

        this.hotkeysService.add(new Hotkey('g s', (event: KeyboardEvent): boolean => {
            console.log('hotkey-g-s');
            window.open('http://slack.exceptionless.com', '_blank');
            return false;
        }, null, 'Go to public slack channel'));
    }

    showIntercom() {
        return false;
    }
}
