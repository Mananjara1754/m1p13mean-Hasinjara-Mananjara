import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { UserService } from '../../services/user.service';
import { Product } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, ProductCardComponent, FooterComponent],
    templateUrl: './favorites.component.html',
    styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
    products: Product[] = [];
    isLoading = true;

    constructor(
        private userService: UserService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.loadFavorites();
    }

    loadFavorites() {
        this.isLoading = true;
        this.userService.getFavorites().subscribe({
            next: (products) => {
                this.products = products;
                this.isLoading = false;
            },
            error: () => {
                this.toastService.error('common.error');
                this.isLoading = false;
            }
        });
    }

    openDetails(product: Product) {
        // For now, redirect to shop detail or open a modal?
        // The user just asked for the list. I'll stick to the list first.
        // If they click on details, we can navigate to shop-detail with the product or something.
        // In ShopDetailComponent it opened a modal.
        // Let's redirect to the shop detail page for now to keep it simple and consistent with the app flow.
        // Or just show it as is.
    }
}
