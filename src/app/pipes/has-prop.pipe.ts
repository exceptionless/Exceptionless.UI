import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "hasProp"
})
export class HasPropPipe implements PipeTransform {
    public transform(value: object, args?: string): boolean {
        return value.hasOwnProperty(args);
    }
}
