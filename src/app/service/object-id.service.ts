import { Injectable } from "@angular/core";
import * as  ObjectId from "objectid-js";

@Injectable({
    providedIn: "root"
})

export class ObjectIdService {
    constructor() {}

    public create(id: string|number): ObjectId {
        return new ObjectId(id);
    }

    public isValid(id: string|number|any) {
        if (!id || !(typeof id === "number" || id instanceof Number) && id.length !== 12 && id.length !== 24) {
            return false;
        }

        if ((typeof id === "string") && id.length === 24) {
            return /^[0-9a-fA-F]{24}$/i.test(id);
        }

        return true;
    }

    public getDate(id: string|number): Date {
        if (!this.isValid(id)) {
            return undefined;
        }

        return this.create(id).getDate();
    }
}
