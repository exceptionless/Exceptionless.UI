import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

interface LastMessage {
    title: string;
    text: string;
    showTime: Date;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
    private _lastMessages: LastMessage[];

    constructor(
        private toastr: ToastrService,
    ) {
        this._lastMessages = [];
    }

    public error(title: string, text: string) {
        if (this.checkShowToast(title, text)) {
            this.toastr.error(text, title);
        }
    }

    public info(title: string, text: string) {
        this.toastr.info(text, title);
    }

    public success(title: string, text: string) {
        this.toastr.success(text, title);
    }

    public warning(title: string, text: string) {
        this.toastr.warning(text, title);
    }

    public checkShowToast(title: string, text: string) {
        const curTime = new Date();
        for (let i = 0; i < this._lastMessages.length; i ++) {
            const msg = this._lastMessages[i];
            const timeDiff = (curTime.getTime() - msg.showTime.getTime()) / 1000;
            if (msg.title === title && msg.text === text) {
                if (timeDiff <= 5) {
                    msg.showTime = curTime;
                    return false;
                }
            }
            if (timeDiff > 5) {
                this._lastMessages.splice(i, 1);
                i --;
            }
        }
        this._lastMessages.push({
            title,
            text,
            showTime: curTime
        } as LastMessage);
        return true;
    }
}
