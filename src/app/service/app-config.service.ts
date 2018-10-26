import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {

    private appConfig;

    constructor (private injector: Injector) { }

    async loadAppConfig() {
        const http = this.injector.get(HttpClient);

        try {
            const data = await http.get('/assets/app-config.json').toPromise();
            this.appConfig = data;
        } catch (error) {
            console.warn('Error loading app-config.json, using envrionment file instead');
            console.log(error);
            this.appConfig = environment;
        }
    }

    get config() {
        return this.appConfig;
    }
}
