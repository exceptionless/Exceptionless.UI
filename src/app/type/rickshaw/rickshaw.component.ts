import { Component, OnInit, ViewChild, Input } from '@angular/core';

@Component({
    selector: 'app-rickshaw',
    templateUrl: './rickshaw.component.html',
    styleUrls: ['./rickshaw.component.less']
})

export class RickshawComponent implements OnInit {
    @Input() options;
    @Input() features;
    richShawOptions: any;
    richShawFeatures: any;

    constructor() {

    }

    ngOnInit() {
        this.richShawOptions = this.options;
        this.richShawFeatures = this.features;

        console.log("options = ", JSON.parse(JSON.stringify(this.options)));

        this.options =  {
            renderer: 'line',
            height: '150px'
        };
    }

}
