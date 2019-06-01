import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ErrorService {
    constructor() {}

    public getExceptions(exception) {
        const exceptions = [];
        let currentException = exception;
        while (currentException) {
            exceptions.push(currentException);
            currentException = currentException.inner;
        }

        return exceptions;
    }

    public getTargetInfo(exception) {
        return exception && exception.data ? exception.data["@target"] : null;
    }

    public getTargetInfoExceptionType(exception) {
        const target = this.getTargetInfo(exception);
        return target && target.ExceptionType ? target.ExceptionType : null;
    }

    public getTargetInfoMethod(exception) {
        const target = this.getTargetInfo(exception);
        return target && target.Method ? target.Method : null;
    }

    public getTargetInfoMessage(exception) {
        const target = this.getTargetInfo(exception);
        return target && target.Message ? target.Message : null;
    }
}
