import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDialogService } from 'ngx-modal-dialog'
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component"

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
    type: string = '';

    constructor(
        private route: ActivatedRoute,
        private modalDialogService: ModalDialogService,
        private viewRef: ViewContainerRef,
    ) {
        this.route.params.subscribe( (params) => { this.type = params['type']; } );
    }

    ngOnInit() {
        /*this.modalDialogService.openDialog(this.viewRef, {
            title: 'Some modal title',
            childComponent: ConfirmDialogComponent
        });*/
    }

}
