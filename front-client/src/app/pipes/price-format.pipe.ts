import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'priceFormat',
    standalone: true
})
export class PriceFormatPipe implements PipeTransform {
    transform(value: number | string | null | undefined): string {
        if (value == null) return '';

        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '';

        // Formats with space as thousands separator and no decimals
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
}
