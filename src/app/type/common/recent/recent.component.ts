import { Component, OnInit } from '@angular/core';
import { EventService } from "../../../service/event.service";

@Component({
    selector: 'app-recent',
    templateUrl: './recent.component.html',
    styleUrls: ['./recent.component.less']
})

export class RecentComponent implements OnInit {
    mostRecent: any = {
        get: this.eventService.getAll,
        options: {
            limit: 20,
            mode: 'summary'
        },
    };

    constructor(
        private eventService: EventService
    ) {
    }

    ngOnInit() {
    }

}
