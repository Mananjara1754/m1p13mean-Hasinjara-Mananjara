import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductFilters } from '../../services/product.service';

export interface ActiveFilters extends ProductFilters {
    // store display values for the sidepanel
}

@Component({
    selector: 'app-filter-sidepanel',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './filter-sidepanel.component.html',
    styleUrl: './filter-sidepanel.component.css'
})
export class FilterSidepanelComponent implements OnInit {
    @Input() isOpen = false;
    @Output() isOpenChange = new EventEmitter<boolean>();
    @Output() filtersChange = new EventEmitter<ActiveFilters>();

    // Local filter state
    minPrice: number | null = null;
    maxPrice: number | null = null;
    minRating = 0;
    maxRating = 5;
    onPromotion = false;
    priceDrop = false;
    sortBy: string = 'date';
    order: 'asc' | 'desc' = 'desc';
    minStock: number | null = null;
    maxStock: number | null = null;

    sortOptions = [
        { value: 'date', labelKey: 'filters.sortByDate' },
        { value: 'price', labelKey: 'filters.sortByPrice' },
        { value: 'rating', labelKey: 'filters.sortByRating' },
        { value: 'discount', labelKey: 'filters.sortByDiscount' },
        { value: 'popularity', labelKey: 'filters.sortByPopularity' },
        { value: 'name', labelKey: 'filters.sortByName' },
    ];

    get activeFiltersCount(): number {
        let count = 0;
        if (this.minPrice !== null || this.maxPrice !== null) count++;
        if (this.minRating > 0 || this.maxRating < 5) count++;
        if (this.onPromotion) count++;
        if (this.priceDrop) count++;
        if (this.minStock !== null || this.maxStock !== null) count++;
        return count;
    }

    ngOnInit() { }

    close() {
        this.isOpen = false;
        this.isOpenChange.emit(false);
    }

    apply() {
        const filters: ActiveFilters = {
            sort_by: this.sortBy as any,
            order: this.order,
        };
        if (this.minPrice !== null) filters.min_price = this.minPrice;
        if (this.maxPrice !== null) filters.max_price = this.maxPrice;
        if (this.minRating > 0) filters.min_rating = this.minRating;
        if (this.maxRating < 5) filters.max_rating = this.maxRating;
        if (this.onPromotion) filters.on_promotion = true;
        if (this.priceDrop) filters.price_drop = true;
        if (this.minStock !== null) filters.min_stock = this.minStock;
        if (this.maxStock !== null) filters.max_stock = this.maxStock;

        this.filtersChange.emit(filters);
        this.close();
    }

    reset() {
        this.minPrice = null;
        this.maxPrice = null;
        this.minRating = 0;
        this.maxRating = 5;
        this.onPromotion = false;
        this.priceDrop = false;
        this.sortBy = 'date';
        this.order = 'desc';
        this.minStock = null;
        this.maxStock = null;
        this.filtersChange.emit({});
        this.close();
    }

    setMinRating(val: number) {
        this.minRating = val;
    }

    ratingStars(n: number): number[] {
        return Array.from({ length: n }, (_, i) => i + 1);
    }
}
