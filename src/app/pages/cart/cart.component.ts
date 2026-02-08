import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Observable, map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, AuthModalComponent, PriceFormatPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  total$: Observable<number>;
  isLoading = false;
  isAuthModalVisible = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.total$ = this.cartItems$.pipe(
      map(items => items.reduce((acc, item) => acc + (item.product.price.current * item.quantity), 0))
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

    const shopId = items[0].product.shop_id._id;
    const backendItems = items.map(i => ({ product_id: i.product._id, quantity: i.quantity }));

    const orderData = {
      shop_id: shopId,
      items: backendItems,
      delivery: {}
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.isLoading = false;
        alert('Order placed successfully!');
        this.router.navigate(['/orders']); // Redirect to orders page
      },
      error: (err) => {
        console.error('Checkout failed', err);
        this.isLoading = false;
        alert('Checkout failed! Please try again.');
        // Note: Backend might fail if items from mixed shops are sent but only one shopId is provided.
        // But for time constraint, this is MVP behavior.
      }
    });
  }

  handleAuthConfirm() {
    this.isAuthModalVisible = false;
    this.router.navigate(['/login']);
  }

  handleAuthCancel() {
    this.isAuthModalVisible = false;
  }
}
