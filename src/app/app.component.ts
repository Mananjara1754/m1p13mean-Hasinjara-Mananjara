import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from './services/cart.service';
import { AuthService, User } from './services/auth.service';
import { TranslationService } from './services/translation.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cartCount$: Observable<number>;
  currentUser$: Observable<User | null>;
  showLanguageDropdown = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    public translationService: TranslationService
  ) {
    this.cartCount$ = this.cartService.cartItems$.pipe(
      map(items => items.reduce((acc, item) => acc + item.quantity, 0))
    );
    this.currentUser$ = this.authService.currentUser$;
  }

  logout() {
    this.authService.logout();
  }

  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  changeLanguage(language: string): void {
    this.translationService.changeLanguage(language);
    this.showLanguageDropdown = false;
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }
}
