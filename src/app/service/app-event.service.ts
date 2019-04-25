import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { NextObserver } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { TypedMessage } from "../models/messaging";

@Injectable({
    providedIn: "root"
})
export class AppEventService {
    private _eventEmitter = new Subject();

    constructor() {
    }

    public subscribe(observer: NextObserver<TypedMessage>): Subscription {
        return this._eventEmitter.subscribe(observer);
    }

    public fireEvent(event: TypedMessage) {
        this._eventEmitter.next(event);
    }

}
