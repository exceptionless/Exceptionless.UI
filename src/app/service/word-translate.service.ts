import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})

export class WordTranslateService {
    private currentPriceUrl = 'http://api.coindesk.com/v1/bpi/currentprice.json';
    constructor(
        private translateService: TranslateService,
    ) {}

    async translate(string): Promise<string> {
        const response = await this.translateService.get(string).toPromise();
        return response;
    }
}
