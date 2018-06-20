import { Injectable } from '@angular/core';
import { NotificationService } from "./notification.service";


@Injectable({
  providedIn: 'root'
})
export class EventsActionService {

  constructor(
      private notificationService: NotificationService,
  ) { }

    deleteAction: object = {
        name: 'Delete',
        run: function (ids) {
            let onSuccess = () => {
                this.notificationService.info('Successfully queued the events for deletion.', 'Success')
            };

            let onFailure = () => {
                this.notificationService.error('An error occurred while deleting the events.', 'Error');
            };

            /*need to implement later*/
        }
    };

    getActions() {
        return [this.deleteAction];
    }
}
