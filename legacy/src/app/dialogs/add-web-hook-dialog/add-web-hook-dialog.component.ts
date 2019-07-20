import { Component, ComponentRef } from "@angular/core";
import { IModalDialog, IModalDialogOptions } from "ngx-modal-dialog";
import { WordTranslateService } from "../../service/word-translate.service";
import { ModalParameterService } from "../../service/modal-parameter.service";

interface WebHookEventTypes {
    key: string;
    name: string;
    description: string;
    checked: boolean;
}

@Component({
    selector: "app-add-web-hook-dialog",
    templateUrl: "./add-web-hook-dialog.component.html"
})

// TODO: Noticing some views are accessing view model data via indexer instead of dot notation.
export class AddWebHookDialogComponent implements IModalDialog {
    private key: string = "";
    public data: {
        url: "",
        event_types: string[]
    };

    public eventTypes: WebHookEventTypes[];

    constructor(
        private wordTranslateService: WordTranslateService,
        private modalParameterService: ModalParameterService
    ) {}

    public async dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        this.key = options.data.key;
        this.eventTypes = await this.getEventTypes();
    }

    public updateValue() {
        this.data.event_types = [];
        for (const eventType of this.eventTypes) {
            if (eventType.checked) {
                this.data.event_types.push(eventType.key);
            }
        }
        this.modalParameterService.setModalParameter(this.key, this.data);
    }

    public async getEventTypes(): Promise<WebHookEventTypes[]> {
        return [
            {
                key: "NewError",
                name: await this.wordTranslateService.translate("New Error"),
                description: await this.wordTranslateService.translate("Occurs when a new error that has never been seen before is reported to your project."),
                checked: false
            },
            {
                key: "CriticalError",
                name: await this.wordTranslateService.translate("Critical Error"),
                description: await this.wordTranslateService.translate("Occurs when an error that has been marked as critical is reported to your project."),
                checked: false
            },
            {
                key: "StackRegression",
                name: await this.wordTranslateService.translate("Regression"),
                description: await this.wordTranslateService.translate("Occurs when an event that has been marked as fixed has reoccurred in your project."),
                checked: false
            },
            {
                key: "NewEvent",
                name: await this.wordTranslateService.translate("New Event"),
                description: await this.wordTranslateService.translate("Occurs when a new event that has never been seen before is reported to your project."),
                checked: false
            },
            {
                key: "CriticalEvent",
                name: await this.wordTranslateService.translate("Critical Event"),
                description: await this.wordTranslateService.translate("Occurs when an event that has been marked as critical is reported to your project."),
                checked: false
            },
            {
                key: "StackPromoted",
                name: await this.wordTranslateService.translate("Promoted"),
                description: await this.wordTranslateService.translate("Used to promote event stacks to external systems."),
                checked: false
            }
        ];
    }

    public hasEventTypeSelection() {
        return this.data.event_types.length > 0;
    }
}
