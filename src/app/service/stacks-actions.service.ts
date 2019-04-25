import { Injectable, ViewContainerRef } from "@angular/core";
import { StackService } from "./stack.service";
import { NotificationService } from "./notification.service";
import { DialogService } from "./dialog.service";
import { chunk } from "lodash-es";

export interface StackAction {
    name: string;
    run(ids: string[], viewRef: ViewContainerRef, callback: () => void): Promise<void>;
}

@Injectable({
    providedIn: "root"
})

export class StacksActionsService {
    private markFixedAction: StackAction = {
        name: "Mark Fixed",
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info("", "Successfully queued the stacks to be marked as fixed.");
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

    private markNotFixedAction: StackAction = {
        name: "Mark Not Fixed",
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info("", "Successfully queued the stacks to be marked as not hidden.");
                callback();
            };

            const onFailure = () => {
                this.notificationService.error("", "An error occurred while marking stacks as not hidden.");
            };

            return this.executeAction(ids, (idArr) => this.stackService.markNotFixed(idArr), onSuccess, onFailure);
        }
    };

    private markHiddenAction: StackAction = {
        name: "Mark Hidden",
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info("", "Successfully queued the stacks to be marked as not hidden.");
                callback();
            };

            const onFailure = () => {
                this.notificationService.error("", "An error occurred while marking stacks as not hidden.");
            };

            return this.executeAction(ids, (idArr) => this.stackService.markHidden(idArr), onSuccess, onFailure);
        }
    };

    private markNotHiddenAction: StackAction = {
        name: "Mark Not Hidden",
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info("", "Successfully queued the stacks to be marked as not hidden.");
                callback();
            };

            const onFailure = () => {
                this.notificationService.error("", "An error occurred while marking stacks as not hidden.");
            };

            return this.executeAction(ids, (idArr) => this.stackService.markNotHidden(idArr), onSuccess, onFailure);
        }
    };

    private deleteAction: StackAction = {
        name: "Delete",
        run: (ids, viewRef, callback) => {
            const onSuccess = () => {
                this.notificationService.info("", "Successfully queued the stacks for deletion.");
                callback();
            };

            const onFailure = () => {
                this.notificationService.error("", "An error occurred while deleting the stacks.");
            };

            const runFunction = () => {
                this.executeAction(ids, (idArr) => this.stackService.remove(idArr), onSuccess, onFailure);
            };

            return this.dialogService.confirmDanger(viewRef, "Are you sure you want to delete these stacks (includes all stack events)?", "DELETE STACKS", runFunction);
        }
    };

    constructor(
        private notificationService: NotificationService,
        private stackService: StackService,
        private dialogService: DialogService
    ) {}

    public async executeAction(ids, action, onSuccess, onFailure) {
        try {
            const res = await chunk(ids, 10).reduce(async (previous, item) => {
                const response = await previous();
                return action(item.join(","));
            }, async () => true );
            onSuccess();
            return res;
        } catch (ex) {
            onFailure();
            return err;
        }
    }

    public getActions(): StackAction[] {
        return [this.markFixedAction, this.markNotFixedAction, this.markHiddenAction, this.markNotHiddenAction, this.deleteAction];
    }
}
