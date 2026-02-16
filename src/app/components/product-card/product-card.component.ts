import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, TranslateModule, PriceFormatPipe],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
    @Input() product!: Product;
    @Output() viewDetails = new EventEmitter<Product>();

    constructor(
        private cartService: CartService,
        private toastService: ToastService,
        private authService: AuthService,
        private userService: UserService
    ) { }

    get starArray(): number[] {
        const rating = this.product.avg_rating || 0;
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const diff = rating - (i - 1);
            if (diff >= 1) {
                stars.push(1);
            } else if (diff > 0) {
                stars.push(diff);
            } else {
                stars.push(0);
            }
        }
        return stars;
    }

    isFavorite(): boolean {
        const user = this.authService.currentUserValue;
        return user?.favorite_products?.includes(this.product._id) || false;
    }

    onToggleFavorite(event: Event) {
        event.stopPropagation();
        if (!this.authService.isAuthenticated()) {
            this.toastService.error('shopDetail.mustBeLoggedIn');
            return;
        }

        if (this.isFavorite()) {
            this.userService.removeFavorite(this.product._id).subscribe({
                next: (res) => {
                    this.toastService.success('shopDetail.removedFromFavorites');
                    this.updateUserFavorites(res.favorite_products);
                }
            });
        } else {
            this.userService.addFavorite(this.product._id).subscribe({
                next: (res) => {
                    this.toastService.success('shopDetail.addedToFavorites');
                    this.updateUserFavorites(res.favorite_products);
                }
            });
        }
    }

    private updateUserFavorites(favs: string[]) {
        const user = this.authService.currentUserValue;
        if (user) {
            const updatedUser = { ...user, favorite_products: favs };
            this.authService.updateCurrentUser(updatedUser);
        }
    }

    onAddToCart() {
        this.cartService.addToCart(this.product);
        this.toastService.success('common.addedToCart', { name: this.product.name });
    }

    onViewDetails() {
        this.viewDetails.emit(this.product);
    }
}
