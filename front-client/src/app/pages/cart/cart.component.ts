import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Observable, map, forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { ToastService } from '../../services/toast.service';

export interface ShopGroup {
  shopId: string;
  shopName: string;
  items: CartItem[];
  total: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, AuthModalComponent, PriceFormatPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  cartItemsByShop$: Observable<ShopGroup[]>;
  total$: Observable<number>;
  isLoading = false;
  isAuthModalVisible = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.cartItems$ = this.cartService.cartItems$;

    // Group cart items by shop
    this.cartItemsByShop$ = this.cartItems$.pipe(
      map(items => {
        const grouped = new Map<string, CartItem[]>();

        items.forEach(item => {
          const shopId = item.product.shop_id._id;
          if (!grouped.has(shopId)) {
            grouped.set(shopId, []);
          }
          grouped.get(shopId)!.push(item);
        });

        return Array.from(grouped.entries()).map(([shopId, shopItems]) => ({
          shopId,
          shopName: shopItems[0].product.shop_id.name,
          items: shopItems,
          total: shopItems.reduce((acc, item) => {
            let price = item.product.price.ttc || (item.product.price.current * 1.2);
            if (item.product.promotion && item.product.promotion.is_active && item.product.promotion.discount_percent > 0) {
              price = price * (1 - item.product.promotion.discount_percent / 100);
            }
            return acc + (price * item.quantity);
          }, 0)
        }));
      })
    );

    this.total$ = this.cartItems$.pipe(
      map(items => items.reduce((acc, item) => {
        let price = item.product.price.ttc || (item.product.price.current * 1.2);
        if (item.product.promotion && item.product.promotion.is_active && item.product.promotion.discount_percent > 0) {
          price = price * (1 - item.product.promotion.discount_percent / 100);
        }
        return acc + (price * item.quantity);
      }, 0))
    );
  }

  ngOnInit() { }

  updateQuantity(item: CartItem, qty: number) {
    this.cartService.updateQuantity(item.product._id, qty);
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
  }

  checkout() {
    this.isLoading = true;
    const items = this.cartService.getItems();
    if (items.length === 0) {
      this.isLoading = false;
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.isAuthModalVisible = true;
      this.isLoading = false;
      return;
    }

    // Group items by shop_id
    const groupedByShop = this.groupItemsByShop(items);

    // Create an array of order observables for each shop (appel api)
    const orderObservables = Array.from(groupedByShop.entries()).map(([shopId, shopItems]) => {
      const backendItems = shopItems.map(i => ({
        product_id: i.product._id,
        quantity: i.quantity
      }));

      const orderData = {
        shop_id: shopId,
        items: backendItems,
        delivery: {}
      };

      return this.orderService.createOrder(orderData);
    });

    // Execute all order creations in parallel (forkJoin)
    forkJoin(orderObservables).subscribe({
      next: (orders) => {
        this.cartService.clearCart();
        this.isLoading = false;
        this.toastService.success(`${orders.length} commande(s) créée(s) avec succès!`);
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('Checkout failed', err);
        this.isLoading = false;
        this.toastService.error('Échec de la commande! Veuillez réessayer.');
      }
    });
  }

  private groupItemsByShop(items: CartItem[]): Map<string, CartItem[]> {
    const grouped = new Map<string, CartItem[]>();

    items.forEach(item => {
      const shopId = item.product.shop_id._id;
      if (!grouped.has(shopId)) {
        grouped.set(shopId, []);
      }
      grouped.get(shopId)!.push(item);
    });

    return grouped;
  }

  handleAuthConfirm() {
    this.isAuthModalVisible = false;
    this.router.navigate(['/login']);
  }

  handleAuthCancel() {
    this.isAuthModalVisible = false;
  }

  getOriginalPrice(product: any): number {
    return product.price.ttc || (product.price.current * 1.2);
  }

  getDiscountedPrice(product: any): number | null {
    if (product.promotion?.is_active && product.promotion.discount_percent > 0) {
      return this.getOriginalPrice(product) * (1 - product.promotion.discount_percent / 100);
    }
    return null;
  }
}
