import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { LinkService } from '../../service/link.service';
import { PaginationService } from '../../service/pagination.service';
import { NotificationService } from '../../service/notification.service';
import { UserService } from '../../service/user.service';
import { WordTranslateService } from '../../service/word-translate.service';

@Component({
    selector: 'app-invoices',
    templateUrl: './invoices.component.html'
})

export class InvoicesComponent implements OnInit {
    @HostBinding('class.app-component') appComponent = true;
    @Input() settings;
    invoices = [];
    next: string;
    previous: string;
    pageSummary: string;
    currentOptions = {};
    loading = true;
    constructor(
        private linkService: LinkService,
        private notificationService: NotificationService,
        private paginationService: PaginationService,
        private userService: UserService,
        private wordTranslateService: WordTranslateService
    ) {}

    ngOnInit() {
        this.get();
    }

    async get(options?) {
        const onSuccess = (response, link) => {
            this.invoices = JSON.parse(JSON.stringify(response));
            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links['previous'];
            this.next = links['next'];
            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions['page'], this.currentOptions['limit']);
            if (this.invoices.length === 0 && this.currentOptions['page'] && this.currentOptions['page'] > 1) {
                return this.get();
            }
            return this.invoices;
        };

        this.currentOptions = options || this.settings.options;

        try {
            const res = await this.settings.get(this.currentOptions).toPromise();
            onSuccess(res.body, res.headers.get('link'));
            this.loading = false;
            return this.invoices;
        } catch (err) {
            this.loading = false;
            this.notificationService.error('', await this.wordTranslateService.translate('Error Occurred!'));
            return err;
        }
    }

    hasAdminRole(user) {
        return this.userService.hasAdminRole(user);
    }

    open(id) {
        /*$window.open($state.href('payment', { id: id }, { absolute: true }), '_blank');*/
    }

    nextPage() {
        return this.get(this.next);
    }

    previousPage() {
        return this.get(this.previous);
    }
}
