import { Component, OnInit, OnDestroy } from '@angular/core';
import { WordTranslateService } from '../../../../service/word-translate.service';
import { NotificationService } from '../../../../service/notification.service';
import { TokenService } from '../../../../service/token.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../../service/project.service';

@Component({
    selector: 'app-project-configure',
    templateUrl: './project-configure.component.html'
})
export class ProjectConfigureComponent implements OnInit, OnDestroy {

    _projectId = '';
    _canRedirect = false;
    apiKey = null;
    currentProjectType: any = {};
    currentProjectTypeKey: any = '';
    project: any = {};
    projectName = '';
    projectTypes: any = [];
    subscriptions: any;

    constructor(
        private wordTranslateService: WordTranslateService,
        private notificationService: NotificationService,
        private tokenService: TokenService,
        private router: Router,
        private projectService: ProjectService,
        private activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.activatedRoute.params.subscribe( (params) => {
            this._projectId = params['id'];
        }));
        this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
            this._canRedirect = params['redirect'] ? (params['redirect'] === 'true') : false;
            console.log(this._canRedirect);
        }));
        this.initData();
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    async initData() {
        this.projectTypes = await this.getProjectTypes();
        await this.getDefaultApiKey();
        await this.getProject();
    }


    canRedirect(data) {
        return this._canRedirect && !!data && data.project_id === this._projectId;
    }

    updateCurrentProjectType() {
        this.currentProjectType = this.projectTypes.filter((o) => o.key === this.currentProjectTypeKey )[0];
    }

    async copied() {
        this.notificationService.success('', await this.wordTranslateService.translate('Copied!'));
    }

    async getDefaultApiKey() {
        const onSuccess = (response) => {
            this.apiKey = response.id;
            return this.apiKey;
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while getting the API key for your project.'));
        };

        try {
            const res = await this.tokenService.getProjectDefault(this._projectId);
            onSuccess(res);
        } catch (err) {
            onFailure();
        }
    }

    async getProject() {
        const onSuccess = (response) => {
            this.project = response;
            this.projectName = this.project['name'] ? ('"' + this.project['name'] + '"') : '';
            return this.project;
        };

        const onFailure = async () => {
            // $state.go('app.dashboard');
            this.router.navigate(['/dashboard']);
            this.notificationService.error('', await this.wordTranslateService.translate('Cannot_Find_Project'));
        };

        try {
            const res = await this.projectService.getById(this._projectId);
            onSuccess(res);
        } catch (err) {
            onFailure();
        }
    }

    async getProjectTypes() {
        return [
            { key: 'Exceptionless', name: await this.wordTranslateService.translate('Console and Service applications'), platform: '.NET' },
            { key: 'Exceptionless.AspNetCore', name: 'ASP.NET Core', platform: '.NET' },
            { key: 'Exceptionless.Mvc', name: 'ASP.NET MVC', config: 'web.config', platform: '.NET' },
            { key: 'Exceptionless.WebApi', name: 'ASP.NET Web API', config: 'web.config', platform: '.NET' },
            { key: 'Exceptionless.Web', name: 'ASP.NET Web Forms', config: 'web.config', platform: '.NET' },
            { key: 'Exceptionless.Windows', name: 'Windows Forms', config: 'app.config', platform: '.NET' },
            { key: 'Exceptionless.Wpf', name: 'Windows Presentation Foundation (WPF)', config: 'app.config', platform: '.NET' },
            { key: 'Exceptionless.Nancy', name: 'Nancy', config: 'app.config', platform: '.NET' },
            { key: 'Exceptionless.JavaScript', name: await this.wordTranslateService.translate('Browser applications'), platform: 'JavaScript' },
            { key: 'Exceptionless.Node', name: 'Node.js', platform: 'JavaScript' }
        ];
    }

    isDotNet() {
        return this.currentProjectType['platform'] === '.NET';
    }

    isJavaScript() {
        return this.currentProjectType['platform'] === 'JavaScript';
    }

    isNode() {
        return this.currentProjectType['platform'] === 'Exceptionless.Node';
    }

    navigateToDashboard(isRefresh?) {
        console.log(isRefresh);
        if (isRefresh && !this.canRedirect(isRefresh)) {
            return;
        }
        this.router.navigate([`/project/${this.project.id}/dashboard`]);
    }

    goToAccountManage() {
        this.router.navigate(['/account/manage'], { queryParams: { tab: 'notifications', projectId: this.project.id } });
    }

    goToProjectManage() {
        this.router.navigate([`/project/${this.project.id}/manage`]);
    }
}
