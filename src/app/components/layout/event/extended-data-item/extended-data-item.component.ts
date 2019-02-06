import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NotificationService } from '../../../../service/notification.service';
import { WordTranslateService } from '../../../../service/word-translate.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
    selector: 'app-extended-data-item',
    templateUrl: './extended-data-item.component.html'
})

export class ExtendedDataItemComponent implements OnInit {
    @Input() title;
    @Input() data;
    @Input() isPromoted;
    @Input() showOptions = true;
    @Output() promoteTabParam = new EventEmitter<any>();
    @Output() demoteTabParam = new EventEmitter<any>();
    showRaw = false;
    clipboardSupported = this.clipboardService.isSupported;

    constructor(
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private clipboardService: ClipboardService,
    ) {}

    ngOnInit() {
        console.log('extended-data-item:', this.data);
    }

    async copied() {
        this.notificationService.success('', await this.wordTranslateService.translate('Copied!'));
    }

    demoteTab() {
        this.demoteTabParam.emit(this.title);
    }

    hasData() {
        console.log(this.data);
        return typeof this.data !== 'undefined' && Object.keys(this.data).length !== 0;
    }

    getData(data, exclusions) {
        const toSpacedWords = (value) => {
            value = value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
            value = value.replace(/([a-z0-9])([A-Z0-9])/g, '$1 $2');
            return value.length > 1 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        };

        exclusions = exclusions && exclusions.length ? exclusions : [];

        if (typeof data !== 'object' || !(data instanceof Object)) {
            return data;
        }

        return Object.keys(data)
            .filter(function(value) { return value && value.length && exclusions.indexOf(value) < 0; })
            .map(function(value) { return { key: value, name: toSpacedWords(value) }; })
            .sort(function(a, b) { return a.name - b.name; })
            .reduce(function(a, b) {
                a[b.name] = data[b.key];
                return a;
            }, {});
    }

    getType() {
        return typeof this.data;
    }

    promoteTab() {
        this.promoteTabParam.emit(this.title);
    }
}
