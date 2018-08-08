import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class ModalParameterService {
    modalParameter = {};
    constructor() {}

    setModalParameter(key, value) {
        this.modalParameter = {};
        this.modalParameter[key] = value;
    }

    getModalParameter(key) {
        return this.modalParameter[key];
    }
}
