import { Injectable } from '@angular/core';
import { FilterService } from "./filter.service"
import { SearchService } from "./search.service"
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})

export class StacksActionsService {

    constructor(
        private filterService: FilterService,
        private searchService: SearchService,
    ) {
    }

    executeAction(ids, action, onSuccess, onFailure) {
        return new Promise((resolve, reject) => {
            this.searchService.validate(this.filterService.getFilter()).then(
                (res) => {
                    onSuccess();

                    resolve(
                        _.chunk(ids, 10).reduce(function (previous, item) {
                            return previous.then(action(item.join(',')));
                        },)
                    );
                },
                (err) => {
                    onFailure();


                    reject(err);
                }
            );
        });
    };
}
