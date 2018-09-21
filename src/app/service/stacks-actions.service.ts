import { Injectable } from '@angular/core';
import { FilterService } from './filter.service';
import { SearchService } from './search.service';
import { StackService } from './stack.service';
import { NotificationService } from './notification.service';
import { DialogService } from './dialog.service';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})

export class StacksActionsService {
    markFixedAction: object = {
        name: 'Mark Fixed',
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info('', 'Successfully queued the stacks to be marked as fixed.');
                callback();
            };

            const onFailure = () => {
            };

            const runFunction = (versionNo) => {
                return this.executeAction(ids, (idArr) => this.stackService.markFixed(idArr, versionNo), onSuccess, onFailure);
            };

            return this.dialogService.markFixed(viewRef, runFunction);
        }
    };

    markNotFixedAction: object = {
        name: 'Mark Not Fixed',
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info('', 'Successfully queued the stacks to be marked as not hidden.');
                callback();
            };

            const onFailure = () => {
                this.notificationService.error('', 'An error occurred while marking stacks as not hidden.');
            };

            return this.executeAction(ids, (idArr) => this.stackService.markNotFixed(idArr), onSuccess, onFailure);
        }
    };

    markHiddenAction: object = {
        name: 'Mark Hidden',
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info('', 'Successfully queued the stacks to be marked as not hidden.');
                callback();
            };

            const onFailure = () => {
                this.notificationService.error('', 'An error occurred while marking stacks as not hidden.');
            };

            return this.executeAction(ids, (idArr) => this.stackService.markHidden(idArr), onSuccess, onFailure);
        }
    };

    markNotHiddenAction: object = {
        name: 'Mark Not Hidden',
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info('', 'Successfully queued the stacks to be marked as not hidden.');
                callback();
            };

            const onFailure = () => {
                this.notificationService.error('', 'An error occurred while marking stacks as not hidden.');
            };

            return this.executeAction(ids, (idArr) => this.stackService.markNotHidden(idArr), onSuccess, onFailure);
        }
    };

    deleteAction: object = {
        name: 'Delete',
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info('', 'Successfully queued the stacks for deletion.');
                callback();
            };

            const onFailure = () => {
                this.notificationService.error('', 'An error occurred while deleting the stacks.');
            };

            const runFunction = () => {
                this.executeAction(ids, (idArr) => this.stackService.remove(idArr), onSuccess, onFailure);
            };

            return this.dialogService.confirmDanger(viewRef, 'Are you sure you want to delete these stacks (includes all stack events)?', 'DELETE STACKS', runFunction);
        }
    };

    constructor(
        private filterService: FilterService,
        private searchService: SearchService,
        private notificationService: NotificationService,
        private stackService: StackService,
        private dialogService: DialogService
    ) {}

    async executeAction(ids, action, onSuccess, onFailure) {
        const promise = _.chunk(ids, 10).reduce(async (previous, item) => {
            const response = await previous();
            return action(item.join(',')).toPromise();
        }, async () => true ).then(onSuccess, onFailure);

        return promise;
    }

    getActions() {
        return [this.markFixedAction, this.markNotFixedAction, this.markHiddenAction, this.markNotHiddenAction, this.deleteAction];
    }
}
