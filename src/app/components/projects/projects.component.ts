import { Component, OnInit, Input, ViewContainerRef, HostBinding } from "@angular/core";
import { Router } from "@angular/router";
import { ProjectService } from "../../service/project.service";
import { LinkService } from "../../service/link.service";
import { PaginationService } from "../../service/pagination.service";
import { NotificationService } from "../../service/notification.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { DialogService } from "../../service/dialog.service";
import { EntityChanged, ChangeType } from "src/app/models/messaging";
import { Project } from "src/app/models/project";

@Component({
    selector: "app-projects",
    templateUrl: "./projects.component.html",
})
export class ProjectsComponent implements OnInit {
    @HostBinding("class.app-component") appComponent: boolean = true;

    @Input() public settings: any;

    public next: string;
    public previous: string;
    public currentOptions: any;
    public loading: boolean = true;
    public pageSummary: string;
    public projects: Project[];
    public includeOrganizationName: boolean;

    constructor(
        private router: Router,
        private projectService: ProjectService,
        private linkService: LinkService,
        private paginationService: PaginationService,
        private notificationService: NotificationService,
        private viewRef: ViewContainerRef,
        private wordTranslateService: WordTranslateService,
        private dialogService: DialogService
    ) {}

    public async ngOnInit() {
        this.includeOrganizationName = !this.settings.organization;
        await this.get();
    }

    private async get(options?, isRefresh?) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }

        this.loading = this.projects.length === 0;
        this.currentOptions = options || this.settings.options;

        try {
            const response = await this.settings.get(this.currentOptions);
            this.projects = response.body;

            const links: any = this.linkService.getLinksQueryParameters(response.headers.get("link"));
            this.previous = links.previous;
            this.next = links.next;

            this.pageSummary = this.paginationService.getCurrentPageSummary(this.projects, this.currentOptions.page, this.currentOptions.limit);
            if (this.projects.length === 0 && this.currentOptions.page && this.currentOptions.page > 1) {
                return await this.get();
            }
        } catch (ex) {
            this.loading = false;
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
            return ex;
        } finally {
            this.loading = false;
        }
    }

    public hasProjects() {
        return this.projects && this.projects.length > 0;
    }

    public canRefresh(message: EntityChanged) { // TODO: This needs to be hooked up to the can refresh.
        if (!message || !message.type) {
            return true;
        }

        const organizationId = this.settings.organization;
        if (message.type === "Organization") {
            if (!this.hasProjects() && message.id === organizationId) {
                return true;
            }

            return this.projects.filter(e => message.id === e.organization_id).length === 0;
        }

        if (message.type === "Project") {
            if (!this.hasProjects() && message.organization_id === organizationId) {
                return true;
            }

            if (message.change_type === ChangeType.Removed) {
                return true;
            }

            return this.projects.filter(e => {
                if (message.id) {
                    return message.id === e.id;
                } else {
                    return message.organization_id = e.organization_id;
                }
            }).length === 0;
        }

        if ((message.type === "PersistentEvent" && message.change_type !== ChangeType.Saved)) {
            if (!this.hasProjects() && message.organization_id === organizationId) {
                return true;
            }

            return this.projects.filter(e => {
                if (message.project_id) {
                    return message.project_id === e.id;
                } else {
                    return message.organization_id = e.organization_id;
                }
            }).length === 0;
        }

        return false;
    }

    public open(id: string, event: MouseEvent) {
        const openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
        if (openInNewTab) {
            window.open(`/project/${id}/manage`, "_blank");
        } else {
            this.router.navigate([`/project/${id}/manage`]);
        }

        event.preventDefault();
    }

    public async nextPage() {
        await this.get(this.next);
    }

    public async previousPage() {
        await this.get(this.previous);
    }

    public async remove(project) {
        const modalCallBackFunction = async () => {
            try {
                await this.projectService.remove(project.id);
                this.projects.splice(this.projects.indexOf(project), 1);
                this.notificationService.success("", await this.wordTranslateService.translate("Successfully queued the project for deletion."));
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to remove the project."));
                throw ex;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to delete this project?", "Delete Project", modalCallBackFunction);
    }
}
