import {Injectable} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class NotificationService {
    constructor(
        private toastr: ToastrService,
    ) {}

    error(title, text) {
        this.toastr.error(text, title);
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
}
