import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from './services/cart.service';
import { AuthService, User } from './services/auth.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cartCount$: Observable<number>;
  currentUser$: Observable<User | null>;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router // Injected for logout
  ) {
    this.cartCount$ = this.cartService.cartItems$.pipe(
      map(items => items.reduce((acc, item) => acc + item.quantity, 0))
    );
    this.currentUser$ = this.authService.currentUser$;
  }

  logout() {
    this.authService.logout();
  }
}
