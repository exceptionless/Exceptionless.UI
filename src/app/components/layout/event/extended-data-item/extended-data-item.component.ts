import { Component, OnInit, Input } from '@angular/core';
import { NotificationService } from '../../../../service/notification.service';
import { WordTranslateService } from '../../../../service/word-translate.service';

@Component({
    selector: 'app-extended-data-item',
    templateUrl: './extended-data-item.component.html'
})

export class ExtendedDataItemComponent implements OnInit {
    @Input() title;
    @Input() data;
    @Input() promoteTabParam;
    @Input() demoteTabParam;
    constructor(
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
    ) {}

    ngOnInit() {
    }

    copied() {
        this.notificationService.success('', this.wordTranslateService.translate('Copied!'));
    }

    demoteTab() {
        // return $scope.demoteTab({ tabName: vm.title });
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

    promoteTab() {
        // return $scope.promoteTab({ tabName: vm.title });
    }
}
