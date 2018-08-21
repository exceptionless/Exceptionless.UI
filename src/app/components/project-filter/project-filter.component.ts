import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../service/notification.service';
import { ProjectService } from '../../service/project.service';
import { OrganizationService } from '../../service/organization.service';
import { FilterService } from '../../service/filter.service';

@Component({
    selector: 'app-project-filter',
    templateUrl: './project-filter.component.html',
    styleUrls: ['./project-filter.component.less']
})

export class ProjectFilterComponent implements OnInit {
    isLoadingOrganizations = true;
    isLoadingProjects = true;
    filteredDisplayName = 'All Projects';
    organizations = [];
    projects = [];
    types = ['error', 'log', '404', 'usage', 'events', 'session'];

    constructor(
        private router: Router,
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private organizationService: OrganizationService,
        private filterService: FilterService,
    ) {}

    ngOnInit() {
        this.getOrganizations().then(() => { this.getProjects(); });
        this.filteredDisplayName = this.filterService.getProjectName();
    }

    getOrganizations() {
        return new Promise((resolve, reject) => {
            this.organizationService.getAll('').subscribe(
                res => {
                    this.organizations = JSON.parse(JSON.stringify(res.body));
                    this.isLoadingOrganizations = false;

                    resolve(this.organizations);
                },
                err => {
                    this.notificationService.error('Error Occurred!', 'Failed');
                    this.isLoadingOrganizations = false;

                    reject(err);
                }
            );
        });
    }

    getProjects() {
        return new Promise((resolve, reject) => {
            this.projectService.getAll('').subscribe(
                res => {
                    this.projects = JSON.parse(JSON.stringify(res.body));
                    this.isLoadingProjects = false;

                    resolve(this.projects);
                },
                err => {
                    this.notificationService.error('Error Occurred!', 'Failed');
                    this.isLoadingProjects = false;

                    reject(err);
                }
            );
        });
    }

    setItem(id, name, type) {
        this.filteredDisplayName = name;
        this.filterService.setProjectFilter(type, id, name);
        const basicURl =  this.getStateName();
        const url = this.router.url;
        const urlTypeArray = url.split('/');
        const urlType = urlTypeArray[urlTypeArray.length - 2];
        if (basicURl) {
            if (type === 'All Projects') {
                if (this.hasType()) {
                    if (urlType === 'session') {
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

    getFilterName() {
        const organizationId = this.filterService.getOrganizationId();
        if (organizationId) {
            const organization = this.organizations.filter(function(o) { return o.id === organizationId; })[0];
            if (organization) {
                return organization.name;
            }
        }

        const projectId = this.filterService.getProjectId();
        if (projectId) {
            const project = this.projects.filter(function(p) { return p.id === projectId; })[0];
            if (project) {
                return project.name;
            }
        }

        return 'All Projects';
    }

    getProjectsByOrganizationId(id) {
        return this.projects.filter(function (project) { return project.organization_id === id; });
    }

    getStateName() {
        const url = this.router.url;
        const urlTypeArray = url.split('/');
        const urlType = urlTypeArray[urlTypeArray.length - 2];
        if (url.endsWith('frequent')) {
            if (this.hasType()) {
                return `${urlType}/frequent`;
            } else {
                return 'frequent';
            }
        }

        if (url.endsWith('new')) {
            if (this.hasType()) {
                return `${urlType}/new`;
            } else {
                return 'new';
            }
        }

        if (url.endsWith('recent')) {
            if (this.hasType()) {
                return `${urlType}/recent`;
            } else {
                return 'recent';
            }
        }

        if (url.endsWith('users')) {
            if (this.hasType()) {
                return `${urlType}/users`;
            } else {
                return 'users';
            }
        }

        if (url.endsWith('dashboard')) {
            if (this.hasType()) {
                return `${urlType}/dashboard`;
            } else {
                return 'dashboard';
            }
        }

        return null;
    }

    hasType() {
        const url = this.router.url;
        const urlTypeArray = url.split('/');
        const urlType = urlTypeArray[urlTypeArray.length - 2];
        const hasType = this.types.some(e => e === urlType);

        return hasType;
    }
}
