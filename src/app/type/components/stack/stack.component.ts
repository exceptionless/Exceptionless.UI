import { Component, OnInit } from '@angular/core';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import * as moment from 'moment';
import * as Rickshaw from 'rickshaw';
import { BillingService } from '../../../service/billing.service';
import { EventService } from '../../../service/event.service';
import { FilterService } from '../../../service/filter.service';
import { NotificationService } from '../../../service/notification.service';
import { OrganizationService } from '../../../service/organization.service';
import { ProjectService } from '../../../service/project.service';
import { StackService } from '../../../service/stack.service';

@Component({
    selector: 'app-stack',
    templateUrl: './stack.component.html',
    styleUrls: ['./stack.component.less']
})
export class StackComponent implements OnInit {
    _organizations = [];
    _stackId = '';
    chart = {
        options: {
            padding: {top: 0.085},
            renderer: 'stack',
            stroke: true,
            unstack: true
        }
    };
    chartOptions = [
        { name: 'Occurrences', field: 'sum:count~1', title: '', selected: true, render: false },
        { name: 'Average Value', field: 'avg:value', title: 'The average of all event values', render: true },
        { name: 'Value Sum', field: 'sum:value', title: 'The sum of all event values', render: true }
    ];
    project = {};
    recentOccurrences = {
        get: (options) => {
            return this.eventService.getByStackId(this._stackId, options);
        },
        summary: {
            showType: false
        },
        options: {
            limit: 10,
            mode: 'summary'
        }
    };
    stack = {};
    stats = {
        count: 0,
        users: this.buildUserStat(0, 0),
        usersTitle: this.buildUserStatTitle(0, 0),
        first_occurrence: undefined,
        last_occurrence: undefined
    };
    users = 0;
    total_users = 0;
    action = '';
    constructor(
        private hotkeysService: HotkeysService,
        private billingService: BillingService,
        private eventService: EventService,
        private filterService: FilterService,
        private notificationService: NotificationService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private stackService: StackService,
    ) {
        this.hotkeysService.add(new Hotkey('shift+h', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey');
            return false; // Prevent bubbling
        }));

        this.hotkeysService.add(new Hotkey('shift+f', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey');
            return false; // Prevent bubbling
        }));

        this.hotkeysService.add(new Hotkey('shift+c', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey');
            return false; // Prevent bubbling
        }));

        this.hotkeysService.add(new Hotkey('shift+m', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey');
            return false; // Prevent bubbling
        }));

        this.hotkeysService.add(new Hotkey('shift+p', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey');
            return false; // Prevent bubbling
        }));

        this.hotkeysService.add(new Hotkey('shift+r', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey');
            return false; // Prevent bubbling
        }));

        this.hotkeysService.add(new Hotkey('shift+backspace', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey');
            return false; // Prevent bubbling
        }));
    }

    ngOnInit() {
    }

    addReferenceLink() {
    }

    buildUserStat(users, totalUsers) {
        if (this.total_users === 0) {
            return 0;
        }

        const percent = users / this.total_users * 100.0;
        return percent;
    }

    buildUserStatTitle(users, totalUsers) {
        return parseInt(users) + ' of ' + parseInt(totalUsers, 0) +  ' users';
    }

    executeAction() {
        const action = this.action;
        if (action === 'mark-fixed' && !(this.stack['date_fixed'] && !this.stack['is_regressed'])) {
            return this.updateIsFixed(true);
        }

        if (action === 'stop-notifications' && !this.stack['disable_notifications']) {
            return this.updateNotifications(true);
        }
    }

    canRefresh(data) {
        if (data && data.type === 'Stack' && data.id === this._stackId) {
            return true;
        }

        if (data && data.type === 'PersistentEvent') {
            if (data['organization_id'] && data['organization_id'] !== this.stack['organization_id']) {
                return false;
            }
            if (data.project_id && data.project_id !== this.stack['project_id']) {
                return false;
            }

            if (data.stack_id && data.stack_id !== this._stackId) {
                return false;
            }

            return true;
        }

        return false;
    }

    get(data) {
        if (data && data.type === 'Stack' && data.deleted) {
            /*$state.go('app.dashboard');*/
            this.notificationService.error('Failed', 'Stack_Deleted');
            return;
        }

        if (data && data.type === 'PersistentEvent') {
            return this.updateStats();
        }

        /*return this.getStack().then(updateStats).then(getProject);*/
    }

    getOrganizations() {
        return new Promise((resolve, reject) => {
            this.organizationService.getAll('', false).subscribe(
                res => {
                    this._organizations = JSON.parse(JSON.stringify(res));

                    resolve(this._organizations);
                },
                err => {
                    this.notificationService.error('Failed', 'Error Occurred!');

                    reject(err);
                },
                () => console.log('Organization Service called!')
            );
        });
    }

    getProject() {
        return new Promise((resolve, reject) => {
            this.projectService.getById(this.stack['project_id'], false).subscribe(
                res => {
                    this.project = JSON.parse(JSON.stringify(res));

                    resolve(this.project);
                },
                err => {
                    this.notificationService.error('Failed', 'Error Occurred!');

                    reject(err);
                },
                () => console.log('Project Service called!')
            );
        });
    }

    getStack() {
        return new Promise((resolve, reject) => {
            this.stackService.getById(this._stackId).subscribe(
                res => {
                    this.stack = JSON.parse(JSON.stringify(res));
                    this.stack['references'] = this.stack['references'] || [];
                    /*addHotkeys();*/
                },
                err => {
                    /*$state.go('app.dashboard');*/
                    if (err.status === 404) {
                        this.notificationService.error('Failed', 'Cannot_Find_Stack');
                    } else {
                        this.notificationService.error('Failed', 'Error_Load_Stack');
                    }
                },
                () => console.log('Stack Service called!')
            );
        });
    }

    getProjectUserStats() {
        const optionsCallback = (options) => {
            options.filter = 'project:' + this.stack['project_id'];
            return options;
        }

        return new Promise((resolve, reject) => {
            this.eventService.count('cardinality:user', optionsCallback).subscribe(
                res => {
                    const getAggregationValue = (data, name, defaultValue) => {
                        const aggs = data.aggregations;
                        return aggs && aggs[name] && aggs[name].value || defaultValue;
                    }

                    this.total_users = getAggregationValue(res['data'], 'cardinality_user', 0);
                    this.stats['users'] = this.buildUserStat(this.users, this.total_users);
                    this.stats['usersTitle'] = this.buildUserStatTitle(this.users, this.total_users);
                    resolve(res);
                },
                err => {
                    reject(err);
                },
                () => console.log('Event Service called!')
            );
        });
    }

    updateStats() {

    }

    getStats() {}

    hasSelectedChartOption() {}

    isValidDate(date) {}

    promoteToExternal() {}

    removeReferenceLink(reference) {}

    remove() {}

    updateIsCritical() {}

    updateIsFixed(showSuccessNotification) {}

    updateIsHidden() {}

    updateNotifications(showSuccessNotification) {}
}
