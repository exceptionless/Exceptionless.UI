import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class NotificationService {
    lastMsgs: any;
    constructor(
        private toastr: ToastrService,
    ) {
        this.lastMsgs = [];
    }

    error(title, text) {
        if (this.checkShowToast(title, text)) {
            this.toastr.error(text, title);
        }
    }

    info(title, text) {
        this.toastr.info(text, title);
    }

    success(title, text) {
        this.toastr.success(text, title);
    }

    warning(title, text) {
        this.toastr.warning(text, title);
    }

    checkShowToast(title, text) {
        const curTime = new Date();
        for (let i = 0; i < this.lastMsgs.length; i ++) {
            const msg = this.lastMsgs[i];
            const timeDiff = (curTime.getTime() - msg.showTime.getTime()) / 1000;
            if (msg.title === title && msg.text === text) {
                if (timeDiff <= 5) {
                    msg.showTime = curTime;
                    return false;
                }
            }
            if (timeDiff > 5) {
                this.lastMsgs.splice(i, 1);
                i --;
            }
        }
        this.lastMsgs.push({
            title:  title,
            text: text,
            showTime: curTime
        });
        return true;
    }
}
