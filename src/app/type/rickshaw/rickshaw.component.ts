import {Component, OnInit} from '@angular/core';
import { rickshaw } from 'ng2-rickshaw';

declare const Rickshaw: any, d3: any;

@Component({
    selector: 'app-rickshaw',
    templateUrl: './rickshaw.component.html',
    styleUrls: ['./rickshaw.component.less']
})
export class RickshawComponent implements OnInit {
    options: any;
    series: any;
    features: any;
    renderer: any;

    constructor() {
        this.options =  {
            renderer: 'line',
            height: '150px'
        };

        this.series = [{
            name: 'Series 1',
            color: 'steelblue',
            data: [{x: 0, y: 23}, {x: 1, y: 15}, {x: 2, y: 79}, {x: 3, y: 31}, {x: 4, y: 60}]
        }, {
            name: 'Series 2',
            color: 'lightblue',
            data: [{x: 0, y: 30}, {x: 1, y: 20}, {x: 2, y: 64}, {x: 3, y: 50}, {x: 4, y: 15}]
        }];

        this.features =  {
        };
    }

    ngOnInit() {
    }

}
