import { Component, Input, SimpleChanges, OnChanges, EventEmitter, Output } from '@angular/core';
import { NotificationService } from '../../../../../service/notification.service';
import { WordTranslateService } from '../../../../../service/word-translate.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
    selector: 'app-event-tabs',
    templateUrl: './event-tabs.component.html'
})

export class EventTabsComponent implements OnChanges {
    @Input() tab;
    @Input() event;
    @Input() project;
    @Input() sessionEvents;
    @Output() promoteTabParam = new EventEmitter<any>();
    @Output() demoteTabParam = new EventEmitter<any>();
    textStackTrace = '';
    clipboardSupported = this.clipboardService.isSupported;

    constructor(
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private clipboardService: ClipboardService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        const tabContent = this.tab;
        console.log('tab = ', tabContent['data']);
    }

    tabPromote(tabName) {
        this.promoteTabParam.emit(tabName);
    }

    tabDemote(tabName) {
        this.demoteTabParam.emit(tabName);
    }

    isPromotedTab() {
        return this.tab.template_key.indexOf('promoted') >= 0;
    }

    async copied() {
        this.notificationService.success('', await  this.wordTranslateService.translate('Copied!'));
    }
}
