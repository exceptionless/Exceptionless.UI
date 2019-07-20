import { Component, OnInit, OnDestroy } from "@angular/core";
import { WordTranslateService } from "../../../../service/word-translate.service";
import { NotificationService } from "../../../../service/notification.service";
import { TokenService } from "../../../../service/token.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ProjectService } from "../../../../service/project.service";
import { Subscription } from "rxjs";
import { Project } from "src/app/models/project";
import { $ExceptionlessClient } from "src/app/exceptionless-client";

interface ProjectType {
    key: string;
    name: string;
    config?: string;
    platform: string;
 }

@Component({
    selector: "app-project-configure",
    templateUrl: "./project-configure.component.html"
})
export class ProjectConfigureComponent implements OnInit, OnDestroy {
    private _projectId: string;
    private _canRedirect: boolean = false; // TODO: This page needs to automatically redirect when a new PersistentEvent comes in... a message will be fired over the websocket...
    public apiKey: string;
    public currentProjectType: ProjectType;
    public currentProjectTypeKey: string;
    private project: Project;
    public projectName: string;
    public projectTypes: ProjectType[];
    private subscriptions: Subscription[];

    constructor(
        private wordTranslateService: WordTranslateService,
        private notificationService: NotificationService,
        private tokenService: TokenService,
        private router: Router,
        private projectService: ProjectService,
        private activatedRoute: ActivatedRoute,
    ) {}

    public async ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.activatedRoute.params.subscribe( (params) => {
            this._projectId = params.id;
        }));

        this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
            this._canRedirect = params.redirect ? (params.redirect === "true") : false;
        }));

        this.projectTypes = await this.getProjectTypes();
        await this.getDefaultApiKey();
        await this.getProject();
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    private canRedirect(data): boolean {
        return this._canRedirect && !!data && data.project_id === this._projectId;
    }

    public updateCurrentProjectType() {
        this.currentProjectType = this.projectTypes.filter((o) => o.key === this.currentProjectTypeKey )[0];
    }

    public async copied() {
        this.notificationService.success("", await this.wordTranslateService.translate("Copied!"));
    }

    async getDefaultApiKey() {
        try {
            const token = await this.tokenService.getProjectDefault(this._projectId);
            this.apiKey = token.id;
        } catch (ex) {
          $ExceptionlessClient.submitException(ex);
          this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while getting the API key for your project."));
        }
    }

    private async getProject() {
        try {
            this.project = await this.projectService.getById(this._projectId);
            this.projectName = this.project.name ? ("\"" + this.project.name + "\"") : "";
        } catch (ex) {
          $ExceptionlessClient.submitException(ex);
          this.notificationService.error("", await this.wordTranslateService.translate("Cannot_Find_Project"));
          await this.router.navigate(["/dashboard"]);
        }
    }

    private async getProjectTypes(): Promise<ProjectType[]> {
        return [
            { key: "Exceptionless", name: await this.wordTranslateService.translate("Console and Service applications"), platform: ".NET" },
            { key: "Exceptionless.AspNetCore", name: "ASP.NET Core", platform: ".NET" },
            { key: "Exceptionless.Mvc", name: "ASP.NET MVC", config: "web.config", platform: ".NET" },
            { key: "Exceptionless.WebApi", name: "ASP.NET Web API", config: "web.config", platform: ".NET" },
            { key: "Exceptionless.Web", name: "ASP.NET Web Forms", config: "web.config", platform: ".NET" },
            { key: "Exceptionless.Windows", name: "Windows Forms", config: "app.config", platform: ".NET" },
            { key: "Exceptionless.Wpf", name: "Windows Presentation Foundation (WPF)", config: "app.config", platform: ".NET" },
            { key: "Exceptionless.Nancy", name: "Nancy", config: "app.config", platform: ".NET" },
            { key: "Exceptionless.JavaScript", name: await this.wordTranslateService.translate("Browser applications"), platform: "JavaScript" },
            { key: "Exceptionless.Node", name: "Node.js", platform: "JavaScript" }
        ];
    }

    public isDotNet(): boolean {
        return this.currentProjectType.platform === ".NET";
    }

    public isJavaScript(): boolean {
        return this.currentProjectType.platform === "JavaScript";
    }

    public isNode(): boolean {
        return this.currentProjectType.platform === "Exceptionless.Node";
    }

    public async navigateToDashboard(isRefresh?: boolean) {
        if (isRefresh && !this.canRedirect(isRefresh)) {
            return;
        }

        await this.router.navigate([`/project/${this.project.id}/dashboard`]);
    }

    public async goToAccountManage() {
        await this.router.navigate(["/account/manage"], { queryParams: { tab: "notifications", projectId: this.project.id } });
    }

    public async goToProjectManage() {
        await this.router.navigate([`/project/${this.project.id}/manage`]);
    }
}
