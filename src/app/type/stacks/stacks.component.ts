import { Component, OnInit } from '@angular/core';
import { FilterService } from "../../service/filter.service"
import { NotificationService } from "../../service/notification.service"

@Component({
    selector: 'app-stacks',
    templateUrl: './stacks.component.html',
    styleUrls: ['./stacks.component.less']
})

export class StacksComponent implements OnInit {

    constructor(
        private filterService: FilterService,
        private notificationService: NotificationService,
    ) {}

    ngOnInit() {
    }

}
