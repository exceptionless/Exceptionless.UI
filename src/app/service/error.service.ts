import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class ErrorService {
    constructor() {}

    getExceptions(exception) {
        const exceptions = [];
        let currentException = exception;
        while (currentException) {
            exceptions.push(currentException);
            currentException = currentException.inner;
        }

        return exceptions;
    }

    getTargetInfo(exception) {
        return exception && exception.data ? exception.data['@target'] : null;
    }

    getTargetInfoExceptionType(exception) {
        const target = this.getTargetInfo(exception);
        return target && target.ExceptionType ? target.ExceptionType : null;
    }

    getTargetInfoMethod(exception) {
        const target = this.getTargetInfo(exception);
        return target && target.Method ? target.Method : null;
    }

    getTargetInfoMessage(exception) {
        const target = this.getTargetInfo(exception);
        return target && target.Message ? target.Message : null;
    }
}
