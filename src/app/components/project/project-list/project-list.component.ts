import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../service/project.service';

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html'
})

export class ProjectListComponent implements OnInit {
    projects = {
        get: (options) => {
            return this.projectService.getAll(options);
        },
        options: {
            limit: 10,
            mode: 'stats'
        }
    };
    constructor(
        private projectService: ProjectService
    ) {}

    ngOnInit() {
    }

}
