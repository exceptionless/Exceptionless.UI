import { Component, Input, SimpleChanges, OnChanges, EventEmitter, Output, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotkeysService } from 'angular2-hotkeys';
import { ClipboardService } from 'ngx-clipboard';
import { BillingService } from '../../../../../service/billing.service';
import { ErrorService } from '../../../../../service/error.service';
import { EventService } from '../../../../../service/event.service';
import { FilterService } from '../../../../../service/filter.service';
import { LinkService } from '../../../../../service/link.service';
import { NotificationService } from '../../../../../service/notification.service';
import { ProjectService } from '../../../../../service/project.service';
import { EventComponent } from '../../event.component';
import { WordTranslateService } from '../../../../../service/word-translate.service';

@Component({
    selector: 'app-event-tabs',
    templateUrl: './event-tabs.component.html'
})

export class EventTabsComponent extends EventComponent implements OnChanges {
    @Input() tab;
    @Output() promoteTabParam = new EventEmitter<any>();
    @Output() demoteTabParam = new EventEmitter<any>();

    constructor(
        router: Router,
        activatedRoute: ActivatedRoute,
        hotkeysService: HotkeysService,
        clipboardService: ClipboardService,
        billingService: BillingService,
        errorService: ErrorService,
        eventService: EventService,
        filterService: FilterService,
        linkService: LinkService,
        notificationService: NotificationService,
        projectService: ProjectService,
        wordTranslateService: WordTranslateService,
        viewRef: ViewContainerRef
    ) {
        super(router, activatedRoute, hotkeysService, clipboardService, billingService, errorService, eventService, filterService, linkService, notificationService, projectService, wordTranslateService, viewRef);
    }

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
}
