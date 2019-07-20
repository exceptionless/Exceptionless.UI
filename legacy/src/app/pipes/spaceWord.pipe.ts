import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "spaceWord"
})

export class SpaceWordPipe implements PipeTransform {
    public transform(value: string): string {
        value = value.replace(/_/g, " ").replace(/\s+/g, " ").trim();
        value = value.replace(/([a-z0-9])([A-Z0-9])/g, "$1 $2");
        return value.length > 1 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    }
}
