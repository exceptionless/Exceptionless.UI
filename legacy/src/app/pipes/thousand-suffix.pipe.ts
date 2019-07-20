import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "thousandSuff"
})
export class ThousandSuffixPipe implements PipeTransform {
    public transform(value: number, fractionDigits?: number): number|string {
        let exp;
        const suffixes = ["k", "M", "G", "T", "P", "E"];

        if (Number.isNaN(value)) {
            return null;
        }

        if (value < 1000) {
            return value;
        }

        exp = Math.floor(Math.log(value) / Math.log(1000));

        return (value / Math.pow(1000, exp)).toFixed(fractionDigits) + suffixes[exp - 1];
    }
}
