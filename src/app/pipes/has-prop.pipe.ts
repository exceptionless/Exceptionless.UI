import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'hasProp'
})
export class HasPropPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        return value.hasOwnProperty(args);
    }
}
