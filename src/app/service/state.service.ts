import { Injectable } from "@angular/core";
import { Locker, DRIVERS } from "angular-safeguard";
import { Router } from "@angular/router";

@Injectable({
    providedIn: "root"
})
export class StateService {

    constructor(
        private locker: Locker,
        private router: Router
    ) {}

    restore() {
        this.router.navigate([this.locker.get(DRIVERS.LOCAL, "state_name")]) ;
    }

    save() {
        this.locker.set(DRIVERS.LOCAL, "state_name", this.router.url);
    }

}
