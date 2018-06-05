import {Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
    type: string = '';

    constructor(
        private route: ActivatedRoute,
    ) {
        this.route.params.subscribe( (params) => { this.type = params['type']; } );
    }

    ngOnInit() {
    }

}
