import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { DialogService } from './dialog.service';
import { EventService } from './event.service';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})

export class EventsActionService {
    constructor(
        private notificationService: NotificationService,
        private dialogService: DialogService,
        private eventService: EventService,
    ) {}

    deleteAction: object = {
        name: 'Delete',
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info('Success', 'Successfully queued the events for deletion.');
                callback();
            };

            const onFailure = () => {
                this.notificationService.error('Error', 'An error occurred while deleting the events.');
            };

            this.dialogService.confirmDanger(viewRef, 'Are you sure you want to delete these events?', 'DELETE EVENTS', async () => {
                try {
                    await this.removeEvent(ids, 0);
                    onSuccess();
                } catch (err) {
                    onFailure();
                }
                return true;
            });
        }
    };

    async removeEvent(ids, i) {
        if (i < ids.length) {
            const temparray = ids.slice(i, i + 10);
            try {
                await this.eventService.remove(temparray.join(','));
                return this.removeEvent(ids, i + 10);
            } catch (e) {
                return false;
            }
        } else {
            return true;
        }
    }

    getActions() {
        return [this.deleteAction];
    }
}
