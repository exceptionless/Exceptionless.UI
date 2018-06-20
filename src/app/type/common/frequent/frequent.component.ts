import { Component, OnInit } from '@angular/core';
import { StackService } from "../../../service/stack.service";

@Component({
    selector: 'app-frequent',
    templateUrl: './frequent.component.html',
    styleUrls: ['./frequent.component.less']
})
export class FrequentComponent implements OnInit {
    mostFrequent: any = {
        get: this.stackService.getFrequent,
        options: {
            limit: 20,
            mode: 'summary'
        }
    };

    constructor(
        private stackService: StackService
    ) {
    }

    ngOnInit() {
    }

}
