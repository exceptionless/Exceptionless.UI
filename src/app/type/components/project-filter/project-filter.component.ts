import {Component, OnInit} from '@angular/core';
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
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private organizationService: OrganizationService,
        private filterService: FilterService,
    ) {}

    ngOnInit() {
        this.getOrganizations().then(() => {this.getProjects(); });
    }

    getOrganizations() {
        return new Promise((resolve, reject) => {
            this.organizationService.getAll('', false).subscribe(
                res => {
                    this.organizations = JSON.parse(JSON.stringify(res));
                    this.isLoadingOrganizations = false;

                    resolve(this.organizations);
                },
                err => {
                    this.notificationService.error('Error Occurred!', 'Failed');
                    this.isLoadingOrganizations = false;

                    reject(err);
                },
                () => console.log('Organization Service called!')
            );
        });
    }

    getProjects() {
        return new Promise((resolve, reject) => {
            this.projectService.getAll('', false).subscribe(
                res => {
                    this.projects = JSON.parse(JSON.stringify(res));
                    this.isLoadingProjects = false;

                    resolve(this.projects);
                },
                err => {
                    this.notificationService.error('Error Occurred!', 'Failed');
                    this.isLoadingProjects = false;

                    reject(err);
                },
                () => console.log('Project Service called!')
            );
        });
    }

    setItem(id, name) {
        this.filteredDisplayName = name;
    }
}
