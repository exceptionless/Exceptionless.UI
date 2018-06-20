import { Component, OnInit } from '@angular/core';
import { StackService } from "../../../service/stack.service";

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.less']
})
export class UsersComponent implements OnInit {
    mostUsers: any = {
        get: this.stackService.getUsers,
        options: {
            limit: 20,
            mode: 'summary'
        },
    };

    constructor(
        private stackService: StackService
    ) {
    }

    ngOnInit() {
    }

}
