import {Component, OnInit} from '@angular/core';
import { StackService } from "../../../service/stack.service";

@Component({
    selector: 'app-new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.less']
})
export class NewComponent implements OnInit {
    newest: any = {
        get: this.stackService.getNew,
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
