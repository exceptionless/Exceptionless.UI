import { Component, OnInit, Input } from '@angular/core';
import { LinkService } from '../../service/link.service';
import { PaginationService } from '../../service/pagination.service';
import { NotificationService } from '../../service/notification.service';
import { UserService } from '../../service/user.service';

@Component({
    selector: 'app-invoices',
    templateUrl: './invoices.component.html',
    host: {'class': 'app-component'}
})

export class InvoicesComponent implements OnInit {
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
        private userService: UserService
    ) {}

    ngOnInit() {
        this.get();
    }

    get(options?) {
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
        return new Promise((resolve, reject) => {
            this.settings.get(this.currentOptions).subscribe(
                res => {
                    onSuccess(res.body, res.headers.get('link'));
                    this.loading = false;
                    resolve(this.invoices);
                },
                err => {
                    this.notificationService.error('Failed', 'Error Occurred!');
                    reject(err);
                }
            );
        });
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
