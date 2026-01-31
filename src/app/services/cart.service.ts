import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  product: any; // Type should be Product
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

  addToCart(product: any, quantity: number = 1) {
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
    return this.cartItemsSubject.value.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  getItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }
}
