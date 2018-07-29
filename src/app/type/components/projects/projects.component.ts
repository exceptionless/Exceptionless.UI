import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../../service/project.service';
import { LinkService } from '../../../service/link.service';
import { PaginationService } from '../../../service/pagination.service';
import { NotificationService } from '../../../service/notification.service';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.less']
})
export class ProjectsComponent implements OnInit {
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
    ) {}

    ngOnInit() {
        this.includeOrganizationName = this.settings['organization'];
        this.get();
    }

    get(options?) {
        const onSuccess = (response, link) => {
            this.projects = JSON.parse(JSON.stringify(response));
            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links['previous'];
            this.next = links['next'];

            this.pageSummary = this.paginationService.getCurrentPageSummary(response.data, this.currentOptions['page'], this.currentOptions['limit']);

            if (this.projects.length === 0 && this.currentOptions['page'] && this.currentOptions['page'] > 1) {
                return this.get();
            }

            return this.projects;
        };

        this.loading = this.projects.length === 0;
        this.currentOptions = options || this.settings.options;

        return new Promise((resolve, reject) => {
            this.settings.get(this.currentOptions).subscribe(
                res => {
                    onSuccess(res.body, res.headers.get('link'));
                    this.loading = false;
                    resolve(this.projects);
                },
                err => {
                    this.notificationService.error('Failed', 'Error Occurred!');
                    reject(err);
                }
            );
        });
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

            return this.projects.filter(function (e) { return data.id === e.organization_id; }).length > 0;
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
            }).length > 0;
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
            }).length > 0;
        }

        return false;
    }

    open(id, event) {
        const openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
        if (openInNewTab) {
            window.open(`/type/project/${id}/manage`, '_blank');
        } else {
            this.router.navigate([`/type/project/${id}/manage`]);
        }

        event.preventDefault();
    }

    nextPage() {
        return this.get(this.next);
    }

    previousPage() {
        return this.get(this.previous);
    }

    remove(project) {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.projectService.remove(project['id']).subscribe(
                    res => {
                        this.projects.splice(this.projects.indexOf(project), 1);
                        this.notificationService.success('Success!', 'Successfully queued the project for deletion.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to remove the project.');
                        reject(err);
                    }
                );
            });
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: 'DIALOGS_CONFIRMATION',
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
                { text: 'Delete Project', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete this project?'
            }
        });
    }
}
