import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NotificationService } from '../../../service/notification.service';
import { ProjectService } from '../../../service/project.service';
import { OrganizationService } from '../../../service/organization.service';
import { FilterService } from '../../../service/filter.service';

@Component({
    selector: 'app-project-filter',
    templateUrl: './project-filter.component.html',
    styleUrls: ['./project-filter.component.less']
})

export class ProjectFilterComponent implements OnInit {
    isLoadingOrganizations = true;
    isLoadingProjects = true;
    filteredDisplayName = 'All Projects';
    organizations: any[];
    projects: any[];

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
        if (basicURl) {
            if (type === 'All Projects') {
                setTimeout(() => { this.router.navigateByUrl(`type/${basicURl}`, { skipLocationChange: false }); }, 100);
            } else {
                setTimeout(() => { this.router.navigateByUrl(`type/${type}/${id}/${basicURl}`, { skipLocationChange: false }); }, 100);
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
        const type = urlTypeArray[urlTypeArray.length - 2];
        if (url.endsWith('frequent')) {
            return `${type}/frequent`;
        }

        if (url.endsWith('new')) {
            return `${type}/new`;
        }

        if (url.endsWith('recent')) {
            return `${type}/recent`;
        }

        if (url.endsWith('users')) {
            return `${type}/users`;
        }

        if (url.endsWith('dashboard')) {
            return `${type}/dashboard`;
        }

        return null;
    }
}
