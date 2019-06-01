import { Injectable, ViewContainerRef } from "@angular/core";
import { NotificationService } from "./notification.service";
import { DialogService } from "./dialog.service";
import { EventService } from "./event.service";

export interface EventAction {
    name: string;
    run(ids: string[], viewRef: ViewContainerRef, callback: () => void): Promise<void>;
}

@Injectable({ providedIn: "root" })
export class EventsActionService {
    constructor(
        private notificationService: NotificationService,
        private dialogService: DialogService,
        private eventService: EventService,
    ) {}

    public deleteAction: EventAction = {
        name: "Delete",
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info("Success", "Successfully queued the events for deletion.");
                callback();
            };

            const onFailure = () => {
                this.notificationService.error("Error", "An error occurred while deleting the events.");
            };

            return this.dialogService.confirmDanger(viewRef, "Are you sure you want to delete these events?", "DELETE EVENTS", async () => {
                try {
                    await this.removeEvent(ids, 0);
                    onSuccess();
                } catch (ex) {
                    onFailure();
                }
                return true;
            });
        }
    };

    public async removeEvent(ids: string[], startingPoint) {
        if (startingPoint < ids.length) {
            const temporary = ids.slice(startingPoint, startingPoint + 10);
            try {
                await this.eventService.remove(temporary.join(","));
                return this.removeEvent(ids, startingPoint + 10);
            } catch (e) {
                return false;
            }
        } else {
            return true;
        }
    }

    getActions(): EventAction[] {
        return [this.deleteAction];
    }
}
