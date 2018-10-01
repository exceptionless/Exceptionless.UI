import { Component, OnInit, Input, ViewContainerRef, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../service/project.service';
import { LinkService } from '../../service/link.service';
import { PaginationService } from '../../service/pagination.service';
import { NotificationService } from '../../service/notification.service';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { WordTranslateService } from '../../service/word-translate.service';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
})

export class ProjectsComponent implements OnInit {
    @HostBinding('class.app-component') appComponent = true;
    @Input() settings;
    next: string;
    previous: string;
    currentOptions = {};
    loading = true;
    pageSummary: string;
    projects = [];
    includeOrganizationName: any;
    constructor(
        private router: Router,
        private projectService: ProjectService,
        private linkService: LinkService,
        private paginationService: PaginationService,
        private notificationService: NotificationService,
        private viewRef: ViewContainerRef,
        private modalDialogService: ModalDialogService,
        private wordTranslateService: WordTranslateService
    ) {}

    ngOnInit() {
        this.includeOrganizationName = !this.settings['organization'];
        this.get();
    }

    async get(options?, isRefresh?) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }
        const onSuccess = (response, link) => {
            this.projects = JSON.parse(JSON.stringify(response));
            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links['previous'];
            this.next = links['next'];

            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions['page'], this.currentOptions['limit']);

            if (this.projects.length === 0 && this.currentOptions['page'] && this.currentOptions['page'] > 1) {
                return this.get();
            }

            return this.projects;
        };

        this.loading = this.projects.length === 0;
        this.currentOptions = options || this.settings.options;

        try {
            const res = await this.settings.get(this.currentOptions).toPromise();
            onSuccess(res.body, res.headers.get('link'));
            this.loading = false;
            return this.projects;
        } catch (err) {
            this.loading = false;
            this.notificationService.error('', this.wordTranslateService.translate('Error Occurred!'));
            return err;
        }
    }

    hasProjects() {
        return this.projects && this.projects.length > 0;
    }

    canRefresh(data) {
        if (!data || !data.type) {
            return true;
        }

        const organizationId = this.settings['organization'];
        if (data['type'] === 'Organization') {
            if (!this.hasProjects() && data['id'] === organizationId) {
                return true;
            }

            return this.projects.filter(function (e) { return data.id === e.organization_id; }).length === 0;
        }

        if (data['type'] === 'Project') {
            if (!this.hasProjects() && data['organization_id'] === organizationId) {
                return true;
            }

            return this.projects.filter(function (e) {
                if (data['id']) {
                    return data['id'] === e.id;
                } else {
                    return data['organization_id'] = e.organization_id;
                }
            }).length === 0;
        }

        if ((data['type'] === 'PersistentEvent' && !data['updated'])) {
            if (!this.hasProjects() && data['organization_id'] === organizationId) {
                return true;
            }

            return this.projects.filter(function (e) {
                if (data['project_id']) {
                    return data['project_id'] === e.id;
                } else {
                    return data['organization_id'] = e.organization_id;
                }
            }).length === 0;
        }

        return false;
    }

    open(id, event) {
        const openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
        if (openInNewTab) {
            window.open(`/project/${id}/manage`, '_blank');
        } else {
            this.router.navigate([`/project/${id}/manage`]);
        }

        event.preventDefault();
    }

    nextPage() {
        return this.get(this.next);
    }

    previousPage() {
        return this.get(this.previous);
    }

    async remove(project) {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.projectService.remove(project['id']).toPromise();
                this.projects.splice(this.projects.indexOf(project), 1);
                this.notificationService.success('', await this.wordTranslateService.translate('Successfully queued the project for deletion.'));
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to remove the project.'));
                return err;
            }
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: await this.wordTranslateService.translate('DIALOGS_CONFIRMATION'),
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
                { text: 'Delete Project', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: await this.wordTranslateService.translate('Are you sure you want to delete this project?')
            }
        });
    }
}
