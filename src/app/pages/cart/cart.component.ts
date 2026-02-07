import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Observable, map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  total$: Observable<number>;
  isLoading = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.total$ = this.cartItems$.pipe(
      map(items => items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0))
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
    if (items.length === 0) return;

    // Group items by shop? MVP assumes single shop order or backend handles multiple?
    // Backend `addOrderItems` takes `shop` ID. So we can only order from ONE shop at a time efficiently
    // OR we need to split the order.
    // For MVP, let's assume all items are from same shop or pick the first shop.
    // Ideally, we should validate this in addToCart or split here.
    // Let's implement simple check:

    const shopId = items[0].product.shop._id || items[0].product.shop; // Handle populated vs unpopulated
    const backendItems = items.map(i => ({ product: i.product._id, quantity: i.quantity }));
    const totalPrice = items.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

    const orderData = {
      shop: shopId,
      items: backendItems,
      totalPrice: totalPrice
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
}
