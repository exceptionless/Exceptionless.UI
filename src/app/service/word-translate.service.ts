import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Injectable({ providedIn: "root" })
export class WordTranslateService {
    constructor(
        private translateService: TranslateService,
    ) {}

    async translate(input: string, params = null): Promise<string> {
        return await this.translateService.get(input, params).toPromise();
    }
}
