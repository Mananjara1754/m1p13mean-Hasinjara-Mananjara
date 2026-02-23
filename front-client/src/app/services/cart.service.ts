import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        this.cartItemsSubject.next(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }

  private saveCart(items: CartItem[]) {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }

  addToCart(product: Product, quantity: number = 1) {
    const items = this.cartItemsSubject.value;
    const existingItem = items.find(item => item.product._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    this.saveCart([...items]);
  }

  updateQuantity(productId: string, quantity: number) {
    let items = this.cartItemsSubject.value;
    const item = items.find(i => i.product._id === productId);

    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
      this.saveCart([...items]);
    }
  }

  removeFromCart(productId: string) {
    const items = this.cartItemsSubject.value.filter(item => item.product._id !== productId);
    this.saveCart(items);
  }

  clearCart() {
    this.saveCart([]);
  }

  getTotal(): number {
    return this.cartItemsSubject.value.reduce((acc, item) => {
      let price = item.product.price.ttc || (item.product.price.current * 1.2);

      // Apply discount if promotion is active
      if (item.product.promotion && item.product.promotion.is_active && item.product.promotion.discount_percent > 0) {
        price = price * (1 - item.product.promotion.discount_percent / 100);
      }

      return acc + (price * item.quantity);
    }, 0);
  }

  getItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }
}
