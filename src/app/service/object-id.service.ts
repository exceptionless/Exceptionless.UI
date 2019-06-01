import { Injectable } from "@angular/core";
import ObjectID from "bson-objectid";

@Injectable({ providedIn: "root" })
export class ObjectIdService {
  constructor() {}

  public create(id: string): ObjectID {
    return new ObjectID(id);
  }

  public isValid(id: string) {
    return ObjectID.isValid(id);
  }

  public getDate(id: string): Date {
    if (!this.isValid(id)) {
        return undefined;
    }

    return new Date(this.create(id).getTimestamp());
  }
}
