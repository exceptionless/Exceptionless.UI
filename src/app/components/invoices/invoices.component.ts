import { Component, OnInit, Input, HostBinding } from "@angular/core";
import { LinkService } from "../../service/link.service";
import { PaginationService } from "../../service/pagination.service";
import { NotificationService } from "../../service/notification.service";
import { UserService } from "../../service/user.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { User } from "src/app/models/user";
import { InvoiceGridModel } from "src/app/models/organization";
import { GetInvoiceParameters } from "src/app/service/organization.service";

export interface InvoiceSettings {
    hideActions?: boolean;
    hideSessionStartTime?: boolean;
    sortByDateDescending?: boolean;
    summary?: { showType: boolean };
    timeHeaderText?: string;
    options?: GetInvoiceParameters;
    get: (options?: GetInvoiceParameters) => Promise<InvoiceGridModel[]>;
}

@Component({
    selector: "app-invoices",
    templateUrl: "./invoices.component.html"
})

export class InvoicesComponent implements OnInit {
    @HostBinding("class.app-component") appComponent = true;
    @Input() private settings: InvoiceSettings;
    public invoices: InvoiceGridModel[];
    public next: GetInvoiceParameters;
    public previous: GetInvoiceParameters;
    public currentOptions: GetInvoiceParameters;
    public pageSummary: string;
    public loading: boolean = true;

    constructor(
        private linkService: LinkService,
        private notificationService: NotificationService,
        private paginationService: PaginationService,
        private userService: UserService,
        private wordTranslateService: WordTranslateService
    ) {}

    public ngOnInit() {
        this.get();
    }

    private async get(options?) {
        this.currentOptions = options || this.settings.options;

        try {
            this.invoices = await this.settings.get(this.currentOptions);
            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links.previous;
            this.next = links.next;
            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions.page, this.currentOptions.limit);
            if (this.invoices.length === 0 && this.currentOptions.page && this.currentOptions.page > 1) {
                return await this.get();
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        } finally {
            this.loading = false;
        }
    }

    public hasAdminRole(user: User): boolean {
        return this.userService.hasAdminRole(user);
    }

    public open(id) {
        // TODO: Open invoice
        /*$window.open($state.href('payment', { id: id }, { absolute: true }), '_blank');*/
    }

    public async nextPage() {
        await this.get(this.next);
    }

    public async previousPage() {
        await this.get(this.previous);
    }
}
