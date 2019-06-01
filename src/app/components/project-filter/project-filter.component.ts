import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NotificationService } from "../../service/notification.service";
import { ProjectService } from "../../service/project.service";
import { OrganizationService } from "../../service/organization.service";
import { FilterService } from "../../service/filter.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { AppEventService } from "../../service/app-event.service";
import { Project } from "src/app/models/project";
import { Organization } from "src/app/models/organization";
import { FilterChanged } from "src/app/models/messaging";

@Component({
    selector: "app-project-filter",
    templateUrl: "./project-filter.component.html",
    styleUrls: ["./project-filter.component.less"]
})

export class ProjectFilterComponent implements OnInit {
    public isLoadingOrganizations: boolean = true;
    public isLoadingProjects: boolean = true;
    public filteredDisplayName: string = "All Projects";
    public organizations: Organization[];
    private projects: Project[];
    private types: string[] = ["error", "log", "404", "usage", "events", "session"];

    constructor(
        private router: Router,
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private organizationService: OrganizationService,
        private filterService: FilterService,
        private wordTranslateService: WordTranslateService,
        private appEvent: AppEventService
    ) {}

    public async ngOnInit() {
        try {
            await this.getOrganizations();
            await this.getProjects();
        } catch (ex) {}

        this.filteredDisplayName = this.filterService.getProjectName();
        if (!this.filteredDisplayName || this.filteredDisplayName === "All Projects") {
            this.filteredDisplayName = "All Projects";
            this.setItem("", "All Projects", "All Projects");
        } else {
            let projectId = this.filterService.getProjectTypeId();
            const projectType = this.filterService.getProjectType();
            if (projectType === "organization") {
                projectId = this.filterService.getOrganizationId();
            }

            const basicURl =  this.getStateName();
            if (basicURl) {
                setTimeout(() => {
                    this.router.navigateByUrl(`/${projectType}/${projectId}/${basicURl}`, { skipLocationChange: false });
                    // TODO: Is this meant to be emitted here? Is there a better place todo this? Seems like the filter service should handle this.. This probably should be calling this.filterService.fireFilterChanged()...
                    this.appEvent.fireEvent({ type: "ProjectFilterChanged", message: new FilterChanged() });
                }, 100);
            }
        }
    }

    private async get() {
        try {
            await this.getOrganizations();
            await this.getProjects();
        } catch (ex) {}
    }

    private async getOrganizations() {
        try {
            this.organizations = await this.organizationService.getAll();
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        } finally {
            this.isLoadingOrganizations = false;
        }
    }

    private async getProjects() {
        try {
            this.projects = await this.projectService.getAll();
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        } finally {
            this.isLoadingProjects = false;
        }
    }

    public isActive(id: string, name: string, type: string): boolean {
        const projectId = this.filterService.getProjectId();
        const projectName = this.filterService.getProjectName();
        const projectType = this.filterService.getProjectType();

        if (id === projectId && name === projectName && projectType === type) {
            return true;
        }

        return false;
    }

    public setItem(id: string, name: string, type: string) {
        this.filteredDisplayName = name;
        this.filterService.setProjectFilter(type, id, name);
        const basicURl =  this.getStateName();
        const url = this.router.url;
        const urlTypeArray = url.split("/");
        const urlType = urlTypeArray[urlTypeArray.length - 2];
        if (basicURl) {
            if (type === "All Projects") {
                if (this.hasType()) {
                    if (urlType === "session") {
                        setTimeout(() => { this.router.navigateByUrl(`/${basicURl}`, { skipLocationChange: false }); }, 100);
                    } else {
                        setTimeout(() => { this.router.navigateByUrl(`/type/${basicURl}`, { skipLocationChange: false }); }, 100);
                    }
                } else {
                    setTimeout(() => { this.router.navigateByUrl(`/${basicURl}`, { skipLocationChange: false }); }, 100);
                }
            } else {
                setTimeout(() => { this.router.navigateByUrl(`/${type}/${id}/${basicURl}`, { skipLocationChange: false }); }, 100);
            }
        }
    }

    private getFilterName() {
        const organizationId = this.filterService.getOrganizationId();
        if (organizationId) {
            const organization = this.organizations.filter(o => o.id === organizationId)[0];
            if (organization) {
                return organization.name;
            }
        }

        const projectId = this.filterService.getProjectId();
        if (projectId) {
            const project = this.projects.filter(p => p.id === projectId)[0];
            if (project) {
                return project.name;
            }
        }

        return "All Projects";
    }

    public getProjectsByOrganizationId(id): Project[] {
        return this.projects
          ? this.projects.filter(project => project.organization_id === id)
          : [];
    }

    public update() {
        this.filteredDisplayName = this.getFilterName();
    }

    private getStateName(): string {
        const url = this.router.url;
        const urlTypeArray = url.split("/");
        const urlType = urlTypeArray[urlTypeArray.length - 2];
        if (url.endsWith("frequent")) {
            if (this.hasType()) {
                return `${urlType}/frequent`;
            } else {
                return "frequent";
            }
        }

        if (url.endsWith("new")) {
            if (this.hasType()) {
                return `${urlType}/new`;
            } else {
                return "new";
            }
        }

        if (url.endsWith("recent")) {
            if (this.hasType()) {
                return `${urlType}/recent`;
            } else {
                return "recent";
            }
        }

        if (url.endsWith("users")) {
            if (this.hasType()) {
                return `${urlType}/users`;
            } else {
                return "users";
            }
        }

        if (url.endsWith("dashboard")) {
            if (this.hasType()) {
                return `${urlType}/dashboard`;
            } else {
                return "dashboard";
            }
        }

        return null;
    }

    private hasType(): boolean {
        const url = this.router.url;
        const urlTypeArray = url.split("/");
        const urlType = urlTypeArray[urlTypeArray.length - 2];
        const hasType = this.types.some(e => e === urlType);

        return hasType;
    }
}
