import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "ObjNgFor"
})

export class ObjNgForPipe implements PipeTransform {
    public transform(value: object): string[] {
        return Object.keys(value);
    }
}
